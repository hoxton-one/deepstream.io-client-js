export enum EVENT {
    UNSOLICITED_MESSAGE,
    IS_CLOSED,
    MAX_RECONNECTION_ATTEMPTS_REACHED,
    CONNECTION_ERROR,
    INVALID_AUTHENTICATION_DETAILS,
    ACK_TIMEOUT,
    UNKNOWN_CORRELATION_ID,
    CONNECTION_STATE_CHANGED = 'onConnectionStateChanged'
}

export enum TOPIC {
    ERROR = 0x00,
    PARSER = 0x01,
    CONNECTION = 0x02,
    AUTH = 0x03,
    EVENT = 0x04,
    RECORD = 0x05,
    RPC = 0x06,
    PRESENCE = 0x07,
}

export enum PARSER_ACTION {
    UNKNOWN_TOPIC = 0x40,
    UNKNOWN_ACTION = 0x41,
    INVALID_MESSAGE = 0x42,
    MESSAGE_PARSE_ERROR = 0x43,
    MAXIMUM_MESSAGE_SIZE_EXCEEDED = 0x44,
}

export enum CONNECTION_ACTION {
    ERROR = 0x00,
    PING = 0x01,
    PONG = 0x02,
    ACCEPT = 0x03,
    CHALLENGE = 0x04,
    CHALLENGE_RESPONSE = 0x05,
    REJECTION = 0x06,
    REDIRECT = 0x07,

    CONNECTION_AUTHENTICATION_TIMEOUT = 0x40
}

export enum AUTH_ACTION {
    ERROR = 0x00,
    REQUEST = 0x01,
    AUTH_SUCCESSFUL = 0x02,
    AUTH_UNSUCCESSFUL = 0x03,

    TOO_MANY_AUTH_ATTEMPTS = 0x40,

    MESSAGE_PERMISSION_ERROR = 0xE0,
    MESSAGE_DENIED = 0xE1,
    INVALID_MESSAGE_DATA = 0xE2,
}

export enum EVENT_ACTION {
    ERROR = 0x00,
    EMIT = 0x01,
    SUBSCRIBE = 0x02,
    SUBSCRIBE_ACK = 0x03,
    UNSUBSCRIBE = 0x04,
    UNSUBSCRIBE_ACK = 0x05,
    LISTEN = 0x06,
    LISTEN_ACK = 0x07,
    UNLISTEN = 0x08,
    UNLISTEN_ACK = 0x09,
    LISTEN_ACCEPT = 0x0A,
    LISTEN_REJECT = 0x0B,
    SUBSCRIPTION_FOR_PATTERN_FOUND = 0x0C,
    SUBSCRIPTION_FOR_PATTERN_REMOVED = 0x0D,

    MESSAGE_PERMISSION_ERROR = 0xE0,
    MESSAGE_DENIED = 0xE1,
    INVALID_MESSAGE_DATA = 0xE2,
    MULTIPLE_SUBSCRIPTIONS = 0xE3,
    NOT_SUBSCRIBED = 0xE4,
    LISTENER_EXISTS = 0xE5,
    NOT_LISTENING = 0xE6
}

export enum RECORD_ACTION {
    ERROR = 0x00,
    CREATE = 0x01,
    READ = 0x02,
    READ_RESPONSE = 0x03,
    HEAD = 0x04,
    HEAD_RESPONSE = 0x05,
    CREATEANDUPDATE = 0x06,
    CREATEANDUPDATE_WITH_WRITE_ACK = 0x07,
    CREATEANDPATCH = 0x08,
    CREATEANDPATCH_WITH_WRITE_ACK = 0x09,
    UPDATE = 0x0A,
    UPDATE_WITH_WRITE_ACK = 0x0C,
    PATCH = 0x0D,
    PATCH_WITH_WRITE_ACK = 0x0E,
    ERASE = 0x0F,
    ERASE_WITH_WRITE_ACK = 0x10,
    WRITE_ACKNOWLEDGEMENT = 0x11,
    DELETE = 0x12,
    DELETE_ACK = 0x13,
    DELETED = 0x14,

    SUBSCRIBEANDHEAD = 0x20,
    // SUBSCRIBEANDHEAD_RESPONSE = 0x21,
    SUBSCRIBEANDREAD = 0x22,
    // SUBSCRIBEANDREAD_RESPONSE = 0x23,
    SUBSCRIBECREATEANDREAD = 0x24,
    // SUBSCRIBECREATEANDREAD_RESPONSE = 0x25,
    SUBSCRIBECREATEANDUPDATE = 0x26,
    // SUBSCRIBECREATEANDUPDATE_RESPONSE = 0x27,
    SUBSCRIBE = 0x28,
    SUBSCRIBE_ACK = 0x29,
    UNSUBSCRIBE = 0x2A,
    UNSUBSCRIBE_ACK = 0x2B,

    LISTEN = 0x30,
    LISTEN_ACK = 0x31,
    UNLISTEN = 0x32,
    UNLISTEN_ACK = 0x33,
    LISTEN_ACCEPT = 0x34,
    LISTEN_REJECT = 0x35,
    SUBSCRIPTION_HAS_PROVIDER = 0x36,
    SUBSCRIPTION_HAS_NO_PROVIDER = 0x37,
    SUBSCRIPTION_FOR_PATTERN_FOUND = 0x38,
    SUBSCRIPTION_FOR_PATTERN_REMOVED = 0x39,

    CACHE_RETRIEVAL_TIMEOUT = 0x40,
    STORAGE_RETRIEVAL_TIMEOUT = 0x41,
    VERSION_EXISTS = 0x42,
    RECORD_LOAD_ERROR = 0x43,
    RECORD_CREATE_ERROR = 0x44,
    RECORD_UPDATE_ERROR = 0x45,
    RECORD_DELETE_ERROR = 0x46,
    RECORD_READ_ERROR = 0x47,
    RECORD_NOT_FOUND = 0x48,
    INVALID_VERSION = 0x49,
    INVALID_PATCH_ON_HOTPATH = 0x4A,

    MESSAGE_PERMISSION_ERROR = 0xE0,
    MESSAGE_DENIED = 0xE1,
    INVALID_MESSAGE_DATA = 0xE2,
    MULTIPLE_SUBSCRIPTIONS = 0xE3,
    NOT_SUBSCRIBED = 0xE4,
    LISTENER_EXISTS = 0xE5,
    NOT_LISTENING = 0xE6
}

export enum RPC_ACTION {
    ERROR = 0x00,
    REQUEST = 0x01,
    ACCEPT = 0x02,
    RESPONSE = 0x03,
    REJECT = 0x04,
    REQUEST_ERROR = 0x05,
    PROVIDE = 0x06,
    PROVIDE_ACK = 0x07,
    UNPROVIDE = 0x08,
    UNPROVIDE_ACK = 0x09,

    NO_RPC_PROVIDER = 0x40,
    ACCEPT_TIMEOUT = 0x42,
    MULTIPLE_ACCEPT = 0x43,
    INVALID_RPC_CORRELATION_ID = 0x44,
    RESPONSE_TIMEOUT = 0x45,
    MULTIPLE_RESPONSE = 0x46,

    MESSAGE_PERMISSION_ERROR = 0xE0,
    MESSAGE_DENIED = 0xE1,
    INVALID_MESSAGE_DATA = 0xE2,
    MULTIPLE_PROVIDERS = 0xE3,
    NOT_PROVIDED = 0xE4
}

export enum PRESENCE_ACTION {
    ERROR = 0x00,
    QUERY_ALL = 0x01,
    QUERY_ALL_RESPONSE = 0x02,
    QUERY = 0x03,
    QUERY_RESPONSE = 0x04,
    PRESENCE_JOIN = 0x05,
    PRESENCE_LEAVE = 0x06,
    SUBSCRIBE = 0x07,
    SUBSCRIBE_ACK = 0x08,
    UNSUBSCRIBE = 0x09,
    UNSUBSCRIBE_ACK = 0x0A,

    INVALID_PRESENCE_USERS = 0x40,

    MESSAGE_PERMISSION_ERROR = 0xE0,
    MESSAGE_DENIED = 0xE1,
    INVALID_MESSAGE_DATA = 0xE2,
    MULTIPLE_SUBSCRIPTIONS = 0xE3,
    NOT_SUBSCRIBED = 0xE4
}

export const ACTIONS = {
    [TOPIC.PARSER]: PARSER_ACTION,
    [TOPIC.CONNECTION]: CONNECTION_ACTION,
    [TOPIC.AUTH]: AUTH_ACTION,
    [TOPIC.EVENT]: EVENT_ACTION,
    [TOPIC.RECORD]: RECORD_ACTION,
    [TOPIC.RPC]: RPC_ACTION,
    [TOPIC.PRESENCE]: PRESENCE_ACTION
}

export enum CONNECTION_STATE {
    CLOSED,
    AWAITING_CONNECTION,
    CHALLENGING,
    AWAITING_AUTHENTICATION,
    AUTHENTICATING,
    OPEN,
    ERROR,
    RECONNECTING,
    TOO_MANY_AUTH_ATTEMPTS,
    REDIRECTING,
    CHALLENGE_DENIED
}
