var Record = require( './record' ),
	AnonymousRecord = require( './anonymous-record' ),
	List = require( './list' ),
	Listener = require( '../utils/listener' ),
	SingleNotifier = require( '../utils/single-notifier' ),
	C = require( '../constants/constants' ),
	messageParser = require( '../message/message-parser' ),
	EventEmitter = require( 'component-emitter' );

/**
 * A collection of factories for records. This class
 * is exposed as client.record
 *
 * @param {Object} options    deepstream options
 * @param {Connection} connection
 * @param {Client} client
 */
var RecordHandler = function( options, connection, client ) {
	this._options = options;
	this._connection = connection;
	this._client = client;
	this._records = {};
	this._lists = {};
	this._listener = {};
	this._destroyEventEmitter = new EventEmitter();

	this._hasRegistry = new SingleNotifier( client, connection, C.TOPIC.RECORD, C.ACTIONS.HAS, this._options.recordReadTimeout );
	this._snapshotRegistry = new SingleNotifier( client, connection, C.TOPIC.RECORD, C.ACTIONS.SNAPSHOT, this._options.recordReadTimeout );
};

/**
 * Returns an existing record or creates a new one.
 *
 * @param   {String} name          		the unique name of the record
 * @param   {[Object]} recordOptions 	A map of parameters for this particular record.
 *                                    	{ persist: true }
 *
 * @public
 * @returns {Record}
 */
RecordHandler.prototype.getRecord = function( name, recordOptions ) {
	if( !this._records[ name ] ) {
		this._records[ name ] = new Record( name, recordOptions || {}, this._connection, this._options, this._client );
		this._records[ name ].on( 'error', this._onRecordError.bind( this, name ) );
		this._records[ name ].on( 'destroy', this._removeRecord.bind( this, name ) );
	}

	this._records[ name ].usages++;

	return this._records[ name ];
};

/**
 * Returns an existing List or creates a new one. A list is a specialised
 * type of record that holds an array of recordNames.
 *
 * @param   {String} name       the unique name of the list
 * @param   {[Object]} options 	A map of parameters for this particular list.
 *                              { persist: true }
 *
 * @public
 * @returns {List}
 */
RecordHandler.prototype.getList = function( name, options ) {
	if( !this._lists[ name ] ) {
		this._lists[ name ] = new List( this, name, options );
	} else {
		this._records[ name ].usages++;
	}
	return this._lists[ name ];
};

/**
 * Returns an anonymous record. A anonymous record is effectively
 * a wrapper that mimicks the API of a record, but allows for the
 * underlying record to be swapped without loosing subscriptions etc.
 *
 * This is particularly useful when selecting from a number of similarly
 * structured records. E.g. a list of users that can be choosen from a list
 *
 * The only API difference to a normal record is an additional setName( name ) method.
 *
 *
 * @public
 * @returns {AnonymousRecord}
 */
RecordHandler.prototype.getAnonymousRecord = function() {
	return new AnonymousRecord( this );
};

/**
 * Allows to listen for record subscriptions made by this or other clients. This
 * is useful to create "active" data providers, e.g. providers that only provide
 * data for a particular record if a user is actually interested in it
 *
 * @param   {String}   pattern  A combination of alpha numeric characters and wildcards( * )
 * @param   {Function} callback
 *
 * @public
 * @returns {void}
 */
RecordHandler.prototype.listen = function( pattern, callback ) {
	if( this._listener[ pattern ] ) {
		this._client._$onError( C.TOPIC.RECORD, C.EVENT.LISTENER_EXISTS, pattern );
	} else {
		this._listener[ pattern ] = new Listener( C.TOPIC.RECORD, pattern, callback, this._options, this._client, this._connection );
	}
};

/**
 * Removes a listener that was previously registered with listenForSubscriptions
 *
 * @param   {String}   pattern  A combination of alpha numeric characters and wildcards( * )
 * @param   {Function} callback
 *
 * @public
 * @returns {void}
 */
RecordHandler.prototype.unlisten = function( pattern ) {
	if( this._listener[ pattern ] ) {
		this._listener[ pattern ].destroy();
		delete this._listener[ pattern ];
	} else {
		this._client._$onError( C.TOPIC.RECORD, C.EVENT.NOT_LISTENING, pattern );
	}
};

/**
 * Retrieve the current record data without subscribing to changes
 *
 * @param   {String}	name the unique name of the record
 * @param   {Function}	callback
 *
 * @public
 */
RecordHandler.prototype.snapshot = function( name, callback ) {
	if( this._records[ name ] && this._records[ name ].isReady ) {
		callback( null, this._records[ name ].get() );
	} else {
		this._snapshotRegistry.request( name, callback );
	}
};

/**
 * Allows the user to query to see whether or not the record exists.
 *
 * @param   {String}	name the unique name of the record
 * @param   {Function}	callback
 *
 * @public
 */
RecordHandler.prototype.has = function( name, callback ) {
	if( this._records[ name ] ) {
		callback( null, true );
	} else {
		this._hasRegistry.request( name, callback );
	}
};

/**
 * Will be called by the client for incoming messages on the RECORD topic
 *
 * @param   {Object} message parsed and validated deepstream message
 *
 * @package private
 * @returns {void}
 */
RecordHandler.prototype._$handle = function( message ) {
	var name;

	if( message.action === C.ACTIONS.ERROR &&
		( message.data[ 0 ] !== C.EVENT.VERSION_EXISTS &&
			message.data[ 0 ] !== C.ACTIONS.SNAPSHOT &&
			message.data[ 0 ] !== C.ACTIONS.HAS  &&
			message.data[ 0 ] !== C.EVENT.MESSAGE_DENIED
		)
	) {
		message.processedError = true;
		this._client._$onError( C.TOPIC.RECORD, message.data[ 0 ], message.data[ 1 ] );
		return;
	}

	if( message.action === C.ACTIONS.ACK || message.action === C.ACTIONS.ERROR ) {
		name = message.data[ 1 ];

		if( message.data[ 0 ] === C.ACTIONS.SNAPSHOT ) {
			message.processedError = true;
			this._snapshotRegistry.recieve( name, message.data[ 2 ] );
			return;
		}

		if( message.data[ 0 ] === C.ACTIONS.HAS ) {
			message.processedError = true;
			this._snapshotRegistry.recieve( name, message.data[ 2 ] );
			return;
		}

	} else {
		name = message.data[ 0 ];
	}

	var processed = false;

	if( this._records[ name ] ) {
		processed = true;
		this._records[ name ]._$onMessage( message );
	}

	if( message.action === C.ACTIONS.READ && this._snapshotRegistry.hasRequest( name ) ) {
		processed = true;
		this._snapshotRegistry.recieve( name, null, JSON.parse( message.data[ 2 ] ) );
	}

	if( message.action === C.ACTIONS.HAS && this._hasRegistry.hasRequest( name ) ) {
		processed = true;
		this._hasRegistry.recieve( name, null, messageParser.convertTyped( message.data[ 1 ] ) );
	}

	if( this._listener[ name ] ) {
		processed = true;
		this._listener[ name ]._$onMessage( message );
	}

	if( !processed ) {
		this._client._$onError( C.TOPIC.RECORD, C.EVENT.UNSOLICITED_MESSAGE, name );
	}
};

/**
 * Callback for 'error' events from the record.
 *
 * @param   {String} recordName
 * @param   {String} error
 *
 * @private
 * @returns {void}
 */
RecordHandler.prototype._onRecordError = function( recordName, error ) {
	this._client._$onError( C.TOPIC.RECORD, error, recordName );
};

/**
 * Callback for 'deleted' and 'discard' events from a record. Removes the record from
 * the registry
 *
 * @param   {String} recordName
 *
 * @returns {void}
 */
RecordHandler.prototype._removeRecord = function( recordName ) {
	delete this._records[ recordName ];
	delete this._lists[ recordName ];
};

module.exports = RecordHandler;
