var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HubEvents, HubMethods, MessageStatus } from './enums.js';
/**
 * Класс для взаимодействия Blazor-компонентов
 * с подключением к хабу SignalR.
 */
export class HubPage {
    constructor() {
        /** Признак успешного старта подключения к хабу */
        this.started = false;
        /**
         * Если true, то вкладка в браузере, в которой открыто текущее подключение,
         * является активной (в ней произошло событие window.onfocus).
         * Если false, то вкладка является неактивной (произошло событие window.onblur).
         */
        this.isActive = true;
        /**
         * Список всех клиентов, подключенных к хабу в настоящий момент.
         */
        this.clientsList = [];
        /**
         * Обработчик события RcvUpdatedPath.
         * Сохраняет код текущего (уже записанного в БД) подключения в Session Storage браузера.
         * После сохранения обработчик вызывает серверный метод GetMyConnection
         * для получения всего объекта Connection.
         * @param cid
         * @param prevcid
         */
        this.onRcvUpdatedPath = (cid, prevcid) => {
            window.sessionStorage.setItem('cid', cid);
            window.localStorage.setItem('cid', cid);
            window.localStorage.setItem('prevcid', prevcid);
            this.prevcid = prevcid;
            this.GetMyConnection();
        };
        /**
         * Обработчик события EnsureActualCid.
         * @param cid
         */
        this.onEnsureActualCid = (cid) => {
            this.cid = cid;
            window.sessionStorage.setItem('cid', cid);
            window.localStorage.setItem('cid', cid);
        };
        /**
         * Обработчик события RcvConnectedEvent.
         * Сохраняет код текущего (только что созданного) подключения в свойство cid этого объекта.
         * Сохранять его в Session Storage браузера сейчас нельзя, т.к. в данный момент в нем
         * может содержаться код предыдущего подключения.
         * После сохранения обработчик вызывает серверный метод UpdateCallerInfo.
         * @param cid
         */
        this.onRcvConnectedEvent = (cid) => {
            this.cid = cid;
            this.started = true;
            this.UpdateCallerInfo();
        };
        /**
         * Обработчик события RcvMyConnection.
         * Получает с сервера объект текущего подключения и сохраняет его в этом объекте.
         * Вызывает серверный метод SendActiveClientsList для получения
         * списка всех активных клиентов, подключенных к хабу.
         * На этом обработка нового подключения к сайту завершена.
         * @param conn
         */
        this.onRcvMyConnection = (conn) => {
            this.connection = conn;
            document.title = conn.Caller.Name;
            //console.dir(conn);
            this.SendActiveClientsList();
        };
        /**
         * Обработчик события UpdMyConnection.
         * Получает с сервера объект текущего подключения и сохраняет его в этом объекте.
         * Событие можно инициировать на стороне сервера в любое время при необходимости,
         * не разрывая текущего подключения.
         * @param conn
         */
        this.onUpdMyConnection = (conn) => {
            if (this.connection.Cid === conn.Cid) {
                this.connection = conn;
            }
            ;
            this.SendActiveClientsList();
        };
        /**
         * Обработчик события RcvActiveClients.
         * @param clients
         */
        this.onRcvActiveClients = (clients) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.clientsList = [];
            let selClientId = (_a = Number.parseInt(window.sessionStorage.getItem('selectedClientId'))) !== null && _a !== void 0 ? _a : 0;
            clients.forEach(cl => {
                cl.IsSelected = cl.Id == selClientId;
                cl.IsCurrent = this.connection.CallerId === cl.Id;
                this.clientsList.push(cl);
            });
            yield HubPage.updateClientsList(this.clientsList);
            this.setSelectedClientId(selClientId);
            let messages = this.client.Messages;
            yield HubPage.addMessagesToCommonChat(messages);
        });
        /**
         * Обрабатывает событие RcvClientUpdate.
         * @param client
         */
        this.onRcvClientUpdate = (client) => {
            let foundClient = this.clientsList.find(f => f.Id === client.Id);
            if (!!foundClient) {
                let index = this.clientsList.indexOf(foundClient);
                this.clientsList.splice(index, 1, client);
            }
            HubPage.addMessagesToCommonChat(client.Messages);
            let unreadMessageIds = this.filterUnreadMessagesToMark();
            if (unreadMessageIds.length > 0) {
                this.MarkUnreadMessages(unreadMessageIds);
            }
        };
        /**
         * Обработчик события RemConnectedClient.
         * @param cid
         * @param clientId
         */
        this.onRemConnectedClient = (cid, clientId) => {
            let found = this.clientsList.find(f => f.Id === clientId);
            let index = this.clientsList.indexOf(found);
            this.clientsList.splice(index, 1);
        };
        /**
         * Обработчик соьбытия AddConnectedClient.
         * @param cid
         * @param client
         */
        this.onAddConnectedClient = (cid, client) => {
        };
        /**
         * Обработчик события RcvClientMessages.
         * @param messages
         */
        this.onRcvClientMessages = (messages) => {
        };
        /**
         * Обработчик события RcvSystemMessage.
         * @param message
         */
        this.onRcvSystemMessage = (message) => __awaiter(this, void 0, void 0, function* () {
            let newMessages = [];
            if (true) {
                let foundMsg = this.client.Messages.find(f => f.Id === message.Id);
                foundMsg.Status = MessageStatus.Read;
                message.Status = MessageStatus.Read;
            }
            newMessages.push(message);
            //this.messages.push(message);
            console.dir(message);
            yield globalThis.HUBPAGE.constructor.addMessagesToCommonChat(newMessages);
            //HubPage.addMessagesToCommonChat(newMessages);
            setTimeout(() => {
                this.MarkUnreadMessages(this.filterUnreadMessagesToMark());
            }, 150);
            //HubPage.prototype.commonChatRef.invokeMethodAsync("AddMessages", newMessages);
            //this.SendActiveClientsList();
            //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;
            //await HubPage.updateClientInfo(this.client);
        });
        /**
         * Обработчик события RcvMessagesUpdateEvent.
         */
        this.onRcvMessagesUpdateEvent = (messages) => {
            console.dir(messages);
            messages.forEach(msg => {
                let foundMsg = this.client.Messages.find(f => f.Id === msg.Id);
                foundMsg.Status = msg.Status;
                foundMsg.ReadOn = msg.ReadOn;
            });
            //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;
            setTimeout(() => {
                if (!!messages.length) {
                    HubPage.markCommonChatMessagesAsRead(messages);
                }
                this.SendActiveClientsList();
                //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;
                //HubPage.updateClientInfo(this.client);
            }, 1000);
        };
        /**
         * Вызов серверного метода GetMyConnection.
         * @returns
         */
        this.GetMyConnection = () => this.hub.invoke(HubMethods.GetMyConnection);
        /**
         * Вызов серверного метода RewriteActualCid.
         * @returns
         */
        this.RewriteActualCid = () => this.hub.invoke(HubMethods.RewriteActualCid);
        /**
         * Вызов серверного метода UpdateCallerInfo, в который передаются сведения
         * о коде подключения из Session Storage браузера
         * (= null, если это первое подключение пользователя к сайту, иначе = код предыдущего подключения) и строка User-Agent.
         * После выполнения серверного метода из него будет вызвано событие RcvUpdatedPath.
         */
        this.UpdateCallerInfo = () => {
            let pcid = window.sessionStorage.getItem('cid');
            let uagent = window.navigator.userAgent;
            this.hub.invoke(HubMethods.UpdateCallerInfo, window.location.pathname, uagent, pcid);
        };
        /**
         * Вызов серверного метода UpdateMyConnection.
         * @returns
         */
        this.UpdateMyConnection = () => this.hub.invoke(HubMethods.UpdateMyConnection);
        /**
         * Вызов серверного метода MarkUnreadMessages.
         * @param messageIds
         * @returns
         */
        this.MarkUnreadMessages = (messageIds) => {
            if (messageIds.length > 0) {
                this.hub.invoke(HubMethods.MarkUnreadMessages, messageIds);
            }
        };
        /**
         * Сохраняет идентификатор выбранного в списке клиента.
         * @param clientId
         * @returns
         */
        this.setSelectedClientId = (clientId) => {
            var _a;
            window.sessionStorage.setItem('selectedClientId', clientId.toString());
            let clientName = !!clientId ? (_a = this.clientsList.find(f => f.Id === clientId)) === null || _a === void 0 ? void 0 : _a.Name : null;
            HubPage.updateSendButtonText(clientId, clientName);
        };
        this.filterUnreadMessagesToMark = () => {
            if (!this.isActive) {
                return [];
            }
            else {
                return this.client.Messages.filter(f => f.Status != MessageStatus.Read && this.connection.CallerId === f.ReceiverId).map(m => m.Id);
            }
        };
    }
    /**
     * Клиентское подключение, соответствующее текущей вкладке в браузере.
     */
    get client() {
        var _a, _b;
        return (_b = (_a = this.clientsList) === null || _a === void 0 ? void 0 : _a.find(f => f.Cid == this.connection.Cid)) !== null && _b !== void 0 ? _b : null;
    }
    //static clientsListRef;
    //static commonChatRef;
    /**
     * Запускает хаб SignalR.
     */
    start() {
        window.onfocus = () => {
            var _a;
            this.isActive = true;
            document.title = `${(_a = this.connection) === null || _a === void 0 ? void 0 : _a.Caller.Name} --- ${this.isActive}`;
            setTimeout(() => {
                this.SendActiveClientsList();
                this.MarkUnreadMessages(this.filterUnreadMessagesToMark());
            });
            //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;
            //HubPage.updateClientInfo(this.client);
        };
        window.onblur = () => {
            var _a;
            this.isActive = false;
            document.title = `${(_a = this.connection) === null || _a === void 0 ? void 0 : _a.Caller.Name} --- ${this.isActive}`;
        };
        this.hub.start().then(function () {
        }).catch(function (err) {
            return console.error(err.toString());
        });
    }
    /**
     * Инициализирует обработчики событий хаба SignalR.
     */
    init() {
        this.hub.on(HubEvents.RcvUpdatedPath, this.onRcvUpdatedPath);
        this.hub.on(HubEvents.EnsureActualCid, this.onEnsureActualCid);
        this.hub.on(HubEvents.RcvConnectedEvent, this.onRcvConnectedEvent);
        this.hub.on(HubEvents.RcvMyConnection, this.onRcvMyConnection);
        this.hub.on(HubEvents.UpdMyConnection, this.onUpdMyConnection);
        this.hub.on(HubEvents.RcvActiveClients, this.onRcvActiveClients);
        this.hub.on(HubEvents.RemConnectedClient, this.onRemConnectedClient);
        this.hub.on(HubEvents.AddConnectedClient, this.onAddConnectedClient);
        globalThis.HUBPAGE.hub.on(HubEvents.RcvSystemMessage, function (message) {
            let newMessages = [];
            if (true) {
                let foundMsg = this.client.Messages.find(f => f.Id === message.Id);
                foundMsg.Status = MessageStatus.Read;
                message.Status = MessageStatus.Read;
            }
            newMessages.push(message);
            //this.messages.push(message);
            console.dir(message);
            globalThis.HUBPAGE.constructor.addMessagesToCommonChat(newMessages);
            //HubPage.addMessagesToCommonChat(newMessages);
            setTimeout(() => {
                this.MarkUnreadMessages(this.filterUnreadMessagesToMark());
            }, 150);
            //HubPage.prototype.commonChatRef.invokeMethodAsync("AddMessages", newMessages);
            //this.SendActiveClientsList();
            //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;
            //await HubPage.updateClientInfo(this.client);
        });
        this.hub.on(HubEvents.RcvMessagesUpdateEvent, this.onRcvMessagesUpdateEvent);
        this.hub.on(HubEvents.RcvClientUpdate, this.onRcvClientUpdate);
        this.start();
    }
    /**
     * Вызов серверного метода SendActiveClientsList.
     * @returns
     */
    SendActiveClientsList() {
        this.hub.invoke(HubMethods.SendActiveClientsList);
    }
    CreateSystemMessage(text) {
        this.hub.invoke(HubMethods.CreateSystemMessage, text);
    }
    static setDotNetHelper(prop, value) {
        HubPage[prop] = value;
    }
    static updateSendButtonText(clientId, clientName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield HubPage.dotNetHelper.invokeMethodAsync("UpdateSendBtnText", clientId, clientName);
        });
    }
    static updateClientsList(clients) {
        return __awaiter(this, void 0, void 0, function* () {
            yield HubPage.dotNetHelper.invokeMethodAsync("UpdateClientsList", clients);
        });
    }
    static updateClientInfo(client) {
        return __awaiter(this, void 0, void 0, function* () {
            yield HubPage.dotNetHelper.invokeMethodAsync("UpdateClientInfo", client);
        });
    }
    static addMessagesToCommonChat(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            yield HubPage.dotNetHelper.invokeMethodAsync("AddMessages", messages);
        });
    }
    static markCommonChatMessagesAsRead(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            yield HubPage.dotNetHelper.invokeMethodAsync("UpdateMessages", messages);
        });
    }
}
globalThis.HUBPAGE = new HubPage();
//# sourceMappingURL=hubPage.js.map