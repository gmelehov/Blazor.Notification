

/** Причины закрытия подключений */
export enum DisconnectReason
{

  None = 0,

  OnRefresh = 1,

  OnBrowse = 2,

  OnReconnect = 3,

  OnError = 4,

  OnExit = 5,

  OnOther = 10,

}







/** Причины открытия подключений */
export enum ConnectReason
{

  None = 0,

  AfterRefresh = 1,

  AfterBrowse = 2,

  AfterReconnect = 3,

  AfterError = 4,

  AfterStart = 5,

  AfterOther = 10,

}






/** Статусы сообщений */
export enum MessageStatus
{

  None = 0,

  Sent = 1,

  Read = 2,

}







/** Типы сообщений */
export enum MessageType
{

  None = 0,

  System = 1,

  Client = 2,

}







/** Целевые чаты для сообщения */
export enum MessageRoute
{

  None = 0,

  Private = 1,

  Common = 2,

}









/** 
 * Названия методов, определенных в интерфейсе IHubClient в хабе SignalR,
 * инициирующих связанные с ними события на стороне клиента.
 */
export enum HubEvents
{

  RcvConnectedEvent = "RcvConnectedEvent",

  RcvUpdatedPath = "RcvUpdatedPath",

  EnsureActualCid = "EnsureActualCid",

  RcvMyConnection = "RcvMyConnection",

  UpdMyConnection = "UpdMyConnection",

  RemConnectedClient = "RemConnectedClient",

  AddConnectedClient = "AddConnectedClient",

  RcvActiveClients = "RcvActiveClients",

  RcvClientMessages = "RcvClientMessages",

  RcvMessagesUpdateEvent = "RcvMessagesUpdateEvent",

  RcvSystemMessage = "RcvSystemMessage",

  RcvClientUpdate = "RcvClientUpdate",

  RequestClientsUpdate = "RequestClientsUpdate",

}




/**
 * Названия методов, определенных в хабе SignalR, выполняющихся на бэкенде 
 * и вызываемых на стороне клиента.
 */
export enum HubMethods
{

  GetMyConnection = "GetMyConnection",

  RewriteActualCid = "RewriteActualCid",

  UpdateCallerInfo = "UpdateCallerInfo",

  UpdateMyConnection = "UpdateMyConnection",

  SendActiveClientsList = "SendActiveClientsList",

  MarkUnreadMessages = "MarkUnreadMessages",

  CreateClientMessage = "CreateClientMessage",

  CreateSystemMessage = "CreateSystemMessage",

}