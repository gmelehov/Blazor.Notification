/** Причины закрытия подключений */
export var DisconnectReason;
(function (DisconnectReason) {
    DisconnectReason[DisconnectReason["None"] = 0] = "None";
    DisconnectReason[DisconnectReason["OnRefresh"] = 1] = "OnRefresh";
    DisconnectReason[DisconnectReason["OnBrowse"] = 2] = "OnBrowse";
    DisconnectReason[DisconnectReason["OnReconnect"] = 3] = "OnReconnect";
    DisconnectReason[DisconnectReason["OnError"] = 4] = "OnError";
    DisconnectReason[DisconnectReason["OnExit"] = 5] = "OnExit";
    DisconnectReason[DisconnectReason["OnOther"] = 10] = "OnOther";
})(DisconnectReason || (DisconnectReason = {}));
/** Причины открытия подключений */
export var ConnectReason;
(function (ConnectReason) {
    ConnectReason[ConnectReason["None"] = 0] = "None";
    ConnectReason[ConnectReason["AfterRefresh"] = 1] = "AfterRefresh";
    ConnectReason[ConnectReason["AfterBrowse"] = 2] = "AfterBrowse";
    ConnectReason[ConnectReason["AfterReconnect"] = 3] = "AfterReconnect";
    ConnectReason[ConnectReason["AfterError"] = 4] = "AfterError";
    ConnectReason[ConnectReason["AfterStart"] = 5] = "AfterStart";
    ConnectReason[ConnectReason["AfterOther"] = 10] = "AfterOther";
})(ConnectReason || (ConnectReason = {}));
/** Статусы сообщений */
export var MessageStatus;
(function (MessageStatus) {
    MessageStatus[MessageStatus["None"] = 0] = "None";
    MessageStatus[MessageStatus["Sent"] = 1] = "Sent";
    MessageStatus[MessageStatus["Read"] = 2] = "Read";
})(MessageStatus || (MessageStatus = {}));
/** Типы сообщений */
export var MessageType;
(function (MessageType) {
    MessageType[MessageType["None"] = 0] = "None";
    MessageType[MessageType["System"] = 1] = "System";
    MessageType[MessageType["Client"] = 2] = "Client";
})(MessageType || (MessageType = {}));
/** Целевые чаты для сообщения */
export var MessageRoute;
(function (MessageRoute) {
    MessageRoute[MessageRoute["None"] = 0] = "None";
    MessageRoute[MessageRoute["Private"] = 1] = "Private";
    MessageRoute[MessageRoute["Common"] = 2] = "Common";
})(MessageRoute || (MessageRoute = {}));
/**
 * Названия методов, определенных в интерфейсе IHubClient в хабе SignalR,
 * инициирующих связанные с ними события на стороне клиента.
 */
export var HubEvents;
(function (HubEvents) {
    HubEvents["RcvConnectedEvent"] = "RcvConnectedEvent";
    HubEvents["RcvUpdatedPath"] = "RcvUpdatedPath";
    HubEvents["RcvMyConnection"] = "RcvMyConnection";
    HubEvents["RcvActiveClients"] = "RcvActiveClients";
    HubEvents["RcvMessagesUpdateEvent"] = "RcvMessagesUpdateEvent";
    HubEvents["RequestClientsUpdate"] = "RequestClientsUpdate";
    HubEvents["RcvMyClientDto"] = "RcvMyClientDto";
})(HubEvents || (HubEvents = {}));
/**
 * Названия методов, определенных в хабе SignalR, выполняющихся на бэкенде
 * и вызываемых на стороне клиента.
 */
export var HubMethods;
(function (HubMethods) {
    HubMethods["GetMyConnection"] = "GetMyConnection";
    HubMethods["UpdateCallerInfo"] = "UpdateCallerInfo";
    HubMethods["SendActiveClientsList"] = "SendActiveClientsList";
    HubMethods["MarkUnreadMessages"] = "MarkUnreadMessages";
    HubMethods["GetMyClientDto"] = "GetMyClientDto";
    HubMethods["PublishCommonMessage"] = "PublishCommonMessage";
    HubMethods["PublishPrivateMessage"] = "PublishPrivateMessage";
})(HubMethods || (HubMethods = {}));
/**
 * Названия методов Blazor-компонентов, выполняющихся на стороне javascript-клиента,
 * осуществившего подключение к хабу SignalR.
 */
export var DotNetMethods;
(function (DotNetMethods) {
    DotNetMethods["UpdateSendBtnText"] = "UpdateSendBtnText";
    DotNetMethods["UpdateClientsList"] = "UpdateClientsList";
    DotNetMethods["UpdateClientInfo"] = "UpdateClientInfo";
    DotNetMethods["AddMessages"] = "AddMessages";
    DotNetMethods["AddPrivateMessages"] = "AddPrivateMessages";
    DotNetMethods["UpdateMessages"] = "UpdateMessages";
})(DotNetMethods || (DotNetMethods = {}));
//# sourceMappingURL=enums.js.map