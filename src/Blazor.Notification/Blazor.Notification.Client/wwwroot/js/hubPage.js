import { DotNetMethods, HubEvents, HubMethods, MessageRoute, MessageStatus } from './enums.js';
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
            this.setDocumentTitle();
            if (!window.sessionStorage.getItem("selectedClientId")) {
                window.sessionStorage.setItem('selectedClientId', "0");
            }
            this.GetMyClientDto();
        };
        /**
         * Обработчик события RcvMyClientDto.
         * Получает с сервера объект текущего клиента и сохраняет его в списке активных клиентов в этом объекте.
         * Вызывает серверный метод SendActiveClientsList для получения
         * списка всех активных клиентов, подключенных к хабу.
         * @param clientDto
         */
        this.onRcvMyClientDto = (clientDto) => {
            var _a;
            if (!this.clientsList.find(f => f.Id == clientDto.Id)) {
                let selClientId = (_a = Number.parseInt(window.sessionStorage.getItem('selectedClientId'))) !== null && _a !== void 0 ? _a : 0;
                clientDto.IsSelected = clientDto.Id === selClientId;
                clientDto.IsCurrent = this.connection.CallerId === clientDto.Id;
                this.clientsList.push(clientDto);
                HubPage.updateClientsList(this.clientsList);
                this.setSelectedClientId(selClientId);
                let messages = this.client.Messages;
                HubPage.addMessagesToCommonChat(messages);
                let unreadMessageIds = this.filterUnreadMessagesToMark();
                this.MarkUnreadMessages(unreadMessageIds);
            }
            this.SendActiveClientsList();
        };
        /**
         * Обработчик события RcvActiveClients.
         * @param clients
         */
        this.onRcvActiveClients = (clients) => {
            var _a;
            this.clientsList = [];
            let selClientId = (_a = Number.parseInt(window.sessionStorage.getItem('selectedClientId'))) !== null && _a !== void 0 ? _a : 0;
            clients.forEach(cl => {
                cl.IsSelected = cl.Id == selClientId;
                cl.IsCurrent = this.connection.CallerId === cl.Id;
                this.clientsList.push(cl);
            });
            HubPage.updateClientsList(this.clientsList);
            this.setSelectedClientId(selClientId);
            let commonMessages = this.client.Messages.filter(f => f.MsgRoute == MessageRoute.Common);
            HubPage.addMessagesToCommonChat(commonMessages);
            let privateMessages = this.client.Messages.filter(f => f.MsgRoute == MessageRoute.Private);
            HubPage.addMessagesToPrivateChat(privateMessages);
            let unreadMessageIds = this.filterUnreadMessagesToMark();
            this.MarkUnreadMessages(unreadMessageIds);
        };
        /**
         * Обрабатывает событие RequestClientsUpdate.
         */
        this.onRequestClientsUpdate = () => {
            this.SendActiveClientsList();
            let unreadMessageIds = this.filterUnreadMessagesToMark();
            this.MarkUnreadMessages(unreadMessageIds);
        };
        /**
         * Обработчик события RcvMessagesUpdateEvent.
         */
        this.onRcvMessagesUpdateEvent = (messages) => {
            messages.forEach(msg => {
                let foundMsg = this.client.Messages.find(f => f.Id === msg.Id);
                foundMsg.Status = msg.Status;
                foundMsg.ReadOn = msg.ReadOn;
            });
            this.SendActiveClientsList();
            if (!!messages.length) {
                HubPage.markCommonChatMessagesAsRead(messages);
            }
        };
        /**
         * Вызов серверного метода GetMyConnection.
         * @returns
         */
        this.GetMyConnection = () => this.hub.invoke(HubMethods.GetMyConnection);
        /**
         * Вызов серверного метода GetMyClientDto.
         * @returns
         */
        this.GetMyClientDto = () => this.hub.invoke(HubMethods.GetMyClientDto);
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
         * Устанавливает название текущей вкладки в браузере.
         */
        this.setDocumentTitle = () => {
            var _a, _b;
            document.title = `${(_b = (_a = this.connection) === null || _a === void 0 ? void 0 : _a.Caller) === null || _b === void 0 ? void 0 : _b.Name} --- ${this.isActive ? "active" : "inactive"}`;
        };
        /**
         * Сохраняет идентификатор выбранного в списке клиента.
         * @param clientId
         * @returns
         */
        this.setSelectedClientId = (clientId) => {
            window.sessionStorage.setItem('selectedClientId', clientId.toString());
            let client = !!clientId ? this.clientsList.find(f => f.Id === clientId) : null;
            let clientName = client === null || client === void 0 ? void 0 : client.Name;
            let clientCid = client === null || client === void 0 ? void 0 : client.Cid;
            if (clientId != 0 && this.hasPrivateMessagesWith(clientId)) {
                let privateMessages = this.client.Messages.filter(f => f.MsgRoute == MessageRoute.Private && clientId != 0
                    && (f.SenderId == this.client.Id || f.SenderId == clientId || f.ReceiverId == this.client.Id || f.ReceiverId == clientId));
                HubPage.addMessagesToPrivateChat(privateMessages);
            }
            else {
                HubPage.addMessagesToPrivateChat([]);
            }
            HubPage.updateSendButtonText(clientId, clientName, clientCid);
        };
        /**
         * Возвращает список идентификаторов непрочтенных на клиенте сообщений,
         * которые нужно передать на сервер для изменения их статуса на "прочтенные".
         * @returns
         */
        this.filterUnreadMessagesToMark = () => {
            var _a, _b, _c;
            if (!this.isActive) {
                return [];
            }
            else {
                return (_c = (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.Messages) === null || _b === void 0 ? void 0 : _b.filter(f => f.Status != MessageStatus.Read && this.connection.CallerId === f.ReceiverId).map(m => m.Id)) !== null && _c !== void 0 ? _c : [];
            }
        };
        /**
         * Возвращает признак наличия сообщений в приватном чате между текущим клиентом
         * и клиентом с указанным идентификатором.
         * @param clientId
         * @returns
         */
        this.hasPrivateMessagesWith = (clientId) => {
            return this.clientsMessages.some(s => s.MsgRoute == MessageRoute.Private && (s.SenderId == clientId || s.ReceiverId == clientId));
        };
    }
    /**
     * Клиентское подключение, соответствующее текущей вкладке в браузере.
     */
    get client() {
        var _a, _b;
        return (_b = (_a = this.clientsList) === null || _a === void 0 ? void 0 : _a.find(f => f.Cid == this.connection.Cid)) !== null && _b !== void 0 ? _b : null;
    }
    get clientsMessages() {
        return this.clientsList.flatMap(m => m.Messages);
    }
    /**
     * Запускает хаб SignalR.
     */
    start() {
        window.onfocus = () => {
            this.isActive = true;
            this.setDocumentTitle();
            setTimeout(() => {
                this.SendActiveClientsList();
                this.MarkUnreadMessages(this.filterUnreadMessagesToMark());
            });
        };
        window.onblur = () => {
            this.isActive = false;
            this.setDocumentTitle();
        };
        this.hub.start().then(function () {
        }).catch(function (err) {
            console.error(err.toString());
            setTimeout(() => {
                this.start();
            }, 800);
        });
    }
    /**
     * Инициализирует обработчики событий хаба SignalR.
     */
    init() {
        this.hub.on(HubEvents.RcvUpdatedPath, this.onRcvUpdatedPath);
        this.hub.on(HubEvents.RcvConnectedEvent, this.onRcvConnectedEvent);
        this.hub.on(HubEvents.RcvMyConnection, this.onRcvMyConnection);
        this.hub.on(HubEvents.RcvActiveClients, this.onRcvActiveClients);
        this.hub.on(HubEvents.RcvMessagesUpdateEvent, this.onRcvMessagesUpdateEvent);
        this.hub.on(HubEvents.RequestClientsUpdate, this.onRequestClientsUpdate);
        this.hub.on(HubEvents.RcvMyClientDto, this.onRcvMyClientDto);
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
        this.hub.invoke(HubMethods.PublishCommonMessage, text);
    }
    CreatePrivateMessage(receiverId, receiverCid, text) {
        this.hub.invoke(HubMethods.PublishPrivateMessage, receiverId, receiverCid, text);
    }
    /**
     * Метод для проброса ссылки на компонент Blazor, метод которого должен быть вызван из JS.
     * @param prop
     * @param value
     */
    static setDotNetHelper(prop, value) {
        HubPage[prop] = value;
    }
    /**
     * Вызов метода UpdateSendBtnText компонента Home.
     * @param clientId
     * @param clientName
     * @param clientCid
     */
    static async updateSendButtonText(clientId, clientName, clientCid) {
        await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateSendBtnText, clientId, clientName, clientCid);
    }
    /**
     * Вызов метода UpdateClientsList компонента Home.
     */
    static async updateClientsList(clients) {
        await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateClientsList, clients);
    }
    /**
     * Вызов метода UpdateClientInfo компонента Home.
     */
    static async updateClientInfo(client) {
        await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateClientInfo, client);
    }
    /**
     * Вызов метода AddMessages компонента Home.
     * @param messages
     */
    static async addMessagesToCommonChat(messages) {
        await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.AddMessages, messages);
    }
    /**
     * Вызов метода AddPrivateMessages компонента Home.
     * @param messages
     */
    static async addMessagesToPrivateChat(messages) {
        await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.AddPrivateMessages, messages);
    }
    /**
     * Вызов метода UpdateMessages компонента Home.
     * @param messages
     */
    static async markCommonChatMessagesAsRead(messages) {
        await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateMessages, messages);
    }
}
globalThis.HUBPAGE = new HubPage();
//# sourceMappingURL=hubPage.js.map