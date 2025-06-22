import * as signalR from '../lib/microsoft/signalr/dist/browser/signalr.js';
import { IConnection, IMessageDto, IServiceClient, IServiceClientDto } from '../ts/interfaces'
import { HubEvents, HubMethods, MessageRoute, MessageStatus } from './enums.js';


/**
 * Класс для взаимодействия Blazor-компонентов 
 * с подключением к хабу SignalR.
 */
export class HubPage
{
  constructor()
  {

  }


  /** Хаб SignalR */
  public hub: signalR.HubConnection;

  /** Признак успешного старта подключения к хабу */
  public started: boolean = false;

  /** 
   * Если true, то вкладка в браузере, в которой открыто текущее подключение,
   * является активной (в ней произошло событие window.onfocus).
   * Если false, то вкладка является неактивной (произошло событие window.onblur).
   */
  public isActive: boolean = true;


  /** Код клиентского подключения */
  public cid: string;

  /** Код предыдущего клиентского подключения */
  public prevcid: string;


  public connection: IConnection;

  /**
   * Список всех клиентов, подключенных к хабу в настоящий момент.
   */
  public clientsList: IServiceClientDto[] = [];

  /**
   * Клиентское подключение, соответствующее текущей вкладке в браузере.
   */
  public get client(): IServiceClientDto
  {
    return this.clientsList?.find(f => f.Cid == this.connection.Cid) ?? null;
  }


  public get clientsMessages(): IMessageDto[]
  {
    return this.clientsList.flatMap(m => (m.Messages as IMessageDto[]));
  }




  static dotNetHelper;

  


  /** 
   * Запускает хаб SignalR.
   */
  start()
  {
    window.onfocus = () =>
    {
      this.isActive = true;
      this.setDocumentTitle();
      setTimeout(() =>
      {
        this.SendActiveClientsList();
        this.MarkUnreadMessages(this.filterUnreadMessagesToMark());
      })      
    }

    window.onblur = () =>
    {
      this.isActive = false;
      this.setDocumentTitle();
    }

    this.hub.start().then(function ()
    {
      
    }).catch(function (err)
    {
      console.error(err.toString());
      setTimeout(() =>
      {
        this.start();
      }, 800)
    });
  }


  /** 
   * Инициализирует обработчики событий хаба SignalR.
   */
  init()
  {
    this.hub.on(HubEvents.RcvUpdatedPath, this.onRcvUpdatedPath);
    this.hub.on(HubEvents.EnsureActualCid, this.onEnsureActualCid);
    this.hub.on(HubEvents.RcvConnectedEvent, this.onRcvConnectedEvent);
    this.hub.on(HubEvents.RcvMyConnection, this.onRcvMyConnection);
    this.hub.on(HubEvents.UpdMyConnection, this.onUpdMyConnection);
    this.hub.on(HubEvents.RcvActiveClients, this.onRcvActiveClients);
    this.hub.on(HubEvents.RemConnectedClient, this.onRemConnectedClient);
    this.hub.on(HubEvents.AddConnectedClient, this.onAddConnectedClient);
    globalThis.HUBPAGE.hub.on(HubEvents.RcvSystemMessage, function (message: IMessageDto) 
    {

      let newMessages: IMessageDto[] = [];

      if (true)
      {
        let foundMsg = this.client.Messages.find(f => f.Id === message.Id);
        foundMsg.Status = MessageStatus.Read;
        message.Status = MessageStatus.Read;
      }

      newMessages.push(message);
      //this.messages.push(message);
      console.dir(message);



      globalThis.HUBPAGE.constructor.addMessagesToCommonChat(newMessages);
      //HubPage.addMessagesToCommonChat(newMessages);

      setTimeout(() =>
      {
        this.MarkUnreadMessages(this.filterUnreadMessagesToMark());
      }, 150);



      //HubPage.prototype.commonChatRef.invokeMethodAsync("AddMessages", newMessages);

      //this.SendActiveClientsList();

      //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;
      //await HubPage.updateClientInfo(this.client);

    });
    this.hub.on(HubEvents.RcvMessagesUpdateEvent, this.onRcvMessagesUpdateEvent);
    this.hub.on(HubEvents.RcvClientUpdate, this.onRcvClientUpdate);
    this.hub.on(HubEvents.RequestClientsUpdate, this.onRequestClientsUpdate);
    this.hub.on("RcvMyClientDto", this.onRcvMyClientDto);

    this.start();
  }


  /**
   * Обработчик события RcvUpdatedPath.
   * Сохраняет код текущего (уже записанного в БД) подключения в Session Storage браузера.
   * После сохранения обработчик вызывает серверный метод GetMyConnection 
   * для получения всего объекта Connection.
   * @param cid
   * @param prevcid
   */
  onRcvUpdatedPath = (cid: string, prevcid: string) =>
  {
    window.sessionStorage.setItem('cid', cid);
    window.localStorage.setItem('cid', cid);
    window.localStorage.setItem('prevcid', prevcid);
    this.prevcid = prevcid;
    this.GetMyConnection();
  }

  /**
   * Обработчик события EnsureActualCid.
   * @param cid
   */
  onEnsureActualCid = (cid: string) =>
  {
    this.cid = cid;
    window.sessionStorage.setItem('cid', cid);
    window.localStorage.setItem('cid', cid);
  }

  /**
   * Обработчик события RcvConnectedEvent.
   * Сохраняет код текущего (только что созданного) подключения в свойство cid этого объекта.
   * Сохранять его в Session Storage браузера сейчас нельзя, т.к. в данный момент в нем
   * может содержаться код предыдущего подключения.
   * После сохранения обработчик вызывает серверный метод UpdateCallerInfo.
   * @param cid
   */
  onRcvConnectedEvent = (cid: string) =>
  {
    this.cid = cid;
    this.started = true;
    this.UpdateCallerInfo();
  }

  /**
   * Обработчик события RcvMyConnection.
   * Получает с сервера объект текущего подключения и сохраняет его в этом объекте.
   * Вызывает серверный метод SendActiveClientsList для получения 
   * списка всех активных клиентов, подключенных к хабу.
   * На этом обработка нового подключения к сайту завершена.
   * @param conn
   */
  onRcvMyConnection = (conn: IConnection) =>
  {
    this.connection = conn;
    this.setDocumentTitle();
    if (!window.sessionStorage.getItem("selectedClientId"))
    {
      window.sessionStorage.setItem('selectedClientId', "0");
    }
    
    this.hub.invoke("GetMyClientDto");
  }


  onRcvMyClientDto = (clientDto: IServiceClientDto) =>
  {
    if (!this.clientsList.find(f => f.Id == clientDto.Id))
    {
      let selClientId = Number.parseInt(window.sessionStorage.getItem('selectedClientId')) ?? 0;
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
  }

  /**
   * Обработчик события UpdMyConnection.
   * Получает с сервера объект текущего подключения и сохраняет его в этом объекте.
   * Событие можно инициировать на стороне сервера в любое время при необходимости,
   * не разрывая текущего подключения.
   * @param conn
   */
  onUpdMyConnection = (conn: IConnection) =>
  {
    if (this.connection.Cid === conn.Cid)
    {
      this.connection = conn;
    };
    this.SendActiveClientsList();
  }

  /**
   * Обработчик события RcvActiveClients.
   * @param clients
   */
  onRcvActiveClients = (clients: IServiceClientDto[]) =>
  {
    this.clientsList = [];
    let selClientId = Number.parseInt(window.sessionStorage.getItem('selectedClientId')) ?? 0;
    clients.forEach(cl =>
    {
      cl.IsSelected = cl.Id == selClientId;
      cl.IsCurrent = this.connection.CallerId === cl.Id;
      this.clientsList.push(cl);
    });

    HubPage.updateClientsList(this.clientsList);
    this.setSelectedClientId(selClientId);

    let commonMessages = this.client.Messages.filter(f => f.MsgRoute == MessageRoute.Common);
    HubPage.addMessagesToCommonChat(commonMessages);

    let privateMessages = this.client.Messages.filter(
      f => f.MsgRoute == MessageRoute.Private
        //&& selClientId != 0
        //&& (f.SenderId == this.client.Id || f.SenderId == selClientId || f.ReceiverId == this.client.Id || f.ReceiverId == selClientId)
    );
    HubPage.addMessagesToPrivateChat(privateMessages);

    let unreadMessageIds = this.filterUnreadMessagesToMark();
    this.MarkUnreadMessages(unreadMessageIds);
  }

  /**
   * Обрабатывает событие RcvClientUpdate.
   * @param client
   */
  onRcvClientUpdate = (client: IServiceClientDto) =>
  {
    let foundClient = this.clientsList.find(f => f.Id === client.Id);
    if (!!foundClient)
    {
      let index = this.clientsList.indexOf(foundClient);
      this.clientsList.splice(index, 1, client);
    }

    let unreadMessageIds = this.filterUnreadMessagesToMark();
    this.MarkUnreadMessages(unreadMessageIds);
  }

  /**
   * Обрабатывает событие RequestClientsUpdate.
   */
  onRequestClientsUpdate = () =>
  {
    this.SendActiveClientsList();
    let unreadMessageIds = this.filterUnreadMessagesToMark();
    this.MarkUnreadMessages(unreadMessageIds);
  }




  /**
   * Обработчик события RemConnectedClient.
   * @param cid
   * @param clientId
   */
  onRemConnectedClient = (cid: string, clientId: number) =>
  {
    let found = this.clientsList.find(f => f.Id === clientId);
    let index = this.clientsList.indexOf(found);
    this.clientsList.splice(index, 1);
  }

  /**
   * Обработчик соьбытия AddConnectedClient.
   * @param cid
   * @param client
   */
  onAddConnectedClient = (cid: string, client: IServiceClient) =>
  {

  }

  /**
   * Обработчик события RcvClientMessages.
   * @param messages
   */
  onRcvClientMessages = (messages: IMessageDto[]) =>
  {

  }

  /**
   * Обработчик события RcvSystemMessage.
   * @param message
   */
  onRcvSystemMessage = async (message: IMessageDto) =>
  {

    let newMessages: IMessageDto[] = [];

    if (true)
    {
      let foundMsg = this.client.Messages.find(f => f.Id === message.Id);
      foundMsg.Status = MessageStatus.Read;
      message.Status = MessageStatus.Read;
    }
    
    newMessages.push(message);
    //this.messages.push(message);
    console.dir(message);



    await globalThis.HUBPAGE.constructor.addMessagesToCommonChat(newMessages);
    //HubPage.addMessagesToCommonChat(newMessages);

    setTimeout(() =>
    {
      this.MarkUnreadMessages(this.filterUnreadMessagesToMark());
    }, 150);

    

    //HubPage.prototype.commonChatRef.invokeMethodAsync("AddMessages", newMessages);

    //this.SendActiveClientsList();

    //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;
    //await HubPage.updateClientInfo(this.client);

  }

  /**
   * Обработчик события RcvMessagesUpdateEvent.
   */
  onRcvMessagesUpdateEvent = (messages: IMessageDto[]) =>
  {
    //console.dir(messages);
    messages.forEach(msg =>
    {
      let foundMsg = this.client.Messages.find(f => f.Id === msg.Id);
      foundMsg.Status = msg.Status;
      foundMsg.ReadOn = msg.ReadOn;
    });
    //this.client.UnreadCommonMsg = this.filterUnreadMessagesToMark().length;

    this.SendActiveClientsList();

    if (!!messages.length)
    {
      HubPage.markCommonChatMessagesAsRead(messages);
    }

    
  }









  /**
   * Вызов серверного метода GetMyConnection.
   * @returns
   */
  GetMyConnection = () => this.hub.invoke(HubMethods.GetMyConnection);

  /**
   * Вызов серверного метода RewriteActualCid.
   * @returns
   */
  RewriteActualCid = () => this.hub.invoke(HubMethods.RewriteActualCid);

  /**
   * Вызов серверного метода UpdateCallerInfo, в который передаются сведения
   * о коде подключения из Session Storage браузера 
   * (= null, если это первое подключение пользователя к сайту, иначе = код предыдущего подключения) и строка User-Agent.
   * После выполнения серверного метода из него будет вызвано событие RcvUpdatedPath.
   */
  UpdateCallerInfo = () =>
  {
    let pcid = window.sessionStorage.getItem('cid');
    let uagent = window.navigator.userAgent;
    this.hub.invoke(HubMethods.UpdateCallerInfo, window.location.pathname, uagent, pcid);
  }

  /**
   * Вызов серверного метода UpdateMyConnection.
   * @returns
   */
  UpdateMyConnection = () => this.hub.invoke(HubMethods.UpdateMyConnection);

  /**
   * Вызов серверного метода SendActiveClientsList.
   * @returns
   */
  SendActiveClientsList()
  {
    this.hub.invoke(HubMethods.SendActiveClientsList);
  }

  /**
   * Вызов серверного метода MarkUnreadMessages.
   * @param messageIds 
   * @returns
   */
  MarkUnreadMessages = (messageIds: number[]) =>
  {
    if (messageIds.length > 0)
    {
      this.hub.invoke(HubMethods.MarkUnreadMessages, messageIds);
    }
  }


  CreateSystemMessage(text: string)
  {
    this.hub.invoke("PublishCommonMessage", text);
  }


  CreatePrivateMessage(receiverId: number, receiverCid: string, text: string)
  {
    this.hub.invoke("PublishPrivateMessage", receiverId, receiverCid, text);
  }







  /**
   * Устанавливает название текущей вкладки в браузере.
   */
  setDocumentTitle = () =>
  {
    document.title = `${this.connection?.Caller?.Name} --- ${this.isActive ? "active" : "inactive"}`;
  }


  /**
   * Сохраняет идентификатор выбранного в списке клиента.
   * @param clientId
   * @returns
   */
  setSelectedClientId = (clientId: number) =>
  {
    window.sessionStorage.setItem('selectedClientId', clientId.toString());
    let client = !!clientId ? this.clientsList.find(f => f.Id === clientId) : null;
    let clientName = client?.Name;
    let clientCid = client?.Cid;

    if (clientId != 0 && this.hasPrivateMessagesWith(clientId))
    {
      let privateMessages: IMessageDto[] = this.client.Messages.filter(
        f => f.MsgRoute == MessageRoute.Private && clientId != 0
          && (f.SenderId == this.client.Id || f.SenderId == clientId || f.ReceiverId == this.client.Id || f.ReceiverId == clientId)
      );      
      HubPage.addMessagesToPrivateChat(privateMessages);
    }
    else
    {
      HubPage.addMessagesToPrivateChat([]);
    }

    HubPage.updateSendButtonText(clientId, clientName, clientCid);
  }


  filterUnreadMessagesToMark = (): number[] =>
  {
    if (!this.isActive)
    {
      return [];
    }
    else
    {
      return this.client?.Messages?.filter(f => f.Status != MessageStatus.Read && this.connection.CallerId === f.ReceiverId).map(m => m.Id) ?? [];
    }
  }


  hasPrivateMessagesWith = (clientId: number): boolean =>
  {
    return this.clientsMessages.some(s => s.MsgRoute == MessageRoute.Private && (s.SenderId == clientId || s.ReceiverId == clientId));
  }









  static setDotNetHelper(prop, value)
  {
    HubPage[prop] = value;
  }




  static async updateSendButtonText(clientId: number, clientName: string, clientCid: string)
  {
    await HubPage.dotNetHelper.invokeMethodAsync("UpdateSendBtnText", clientId, clientName, clientCid);
  }


  static async updateClientsList(clients: IServiceClientDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync("UpdateClientsList", clients);
  }


  static async updateClientInfo(client: IServiceClientDto)
  {
    await HubPage.dotNetHelper.invokeMethodAsync("UpdateClientInfo", client);
  }


  static async addMessagesToCommonChat(messages: IMessageDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync("AddMessages", messages);
  }


  static async addMessagesToPrivateChat(messages: IMessageDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync("AddPrivateMessages", messages);
  }


  static async markCommonChatMessagesAsRead(messages: IMessageDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync("UpdateMessages", messages);
  }






}





globalThis.HUBPAGE = new HubPage();
