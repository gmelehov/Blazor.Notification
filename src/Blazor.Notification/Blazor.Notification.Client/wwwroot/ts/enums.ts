

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

  RcvMyConnection = "RcvMyConnection",

  RcvActiveClients = "RcvActiveClients",

  RcvMessagesUpdateEvent = "RcvMessagesUpdateEvent",

  RequestClientsUpdate = "RequestClientsUpdate",

  RcvMyClientDto = "RcvMyClientDto",

}




/**
 * Названия методов, определенных в хабе SignalR, выполняющихся на бэкенде 
 * и вызываемых на стороне клиента.
 */
export enum HubMethods
{

  GetMyConnection = "GetMyConnection",

  UpdateCallerInfo = "UpdateCallerInfo",

  SendActiveClientsList = "SendActiveClientsList",

  MarkUnreadMessages = "MarkUnreadMessages",

  GetMyClientDto = "GetMyClientDto",

  PublishCommonMessage = "PublishCommonMessage",

  PublishPrivateMessage = "PublishPrivateMessage"

}




/**
 * Названия методов Blazor-компонентов, выполняющихся на стороне javascript-клиента,
 * осуществившего подключение к хабу SignalR.
 */
export enum DotNetMethods
{

  UpdateSendBtnText = "UpdateSendBtnText",

  UpdateClientsList = "UpdateClientsList",

  UpdateClientInfo = "UpdateClientInfo",

  AddMessages = "AddMessages",

  AddPrivateMessages = "AddPrivateMessages",

  UpdateMessages = "UpdateMessages",

}