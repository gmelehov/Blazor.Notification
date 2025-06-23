import * as signalR from '../lib/microsoft/signalr/dist/browser/signalr.js';
import { IConnection, IMessageDto, IServiceClientDto } from '../ts/interfaces'
import { DotNetMethods, HubEvents, HubMethods, MessageRoute, MessageStatus } from './enums.js';


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
    this.hub.on(HubEvents.RcvConnectedEvent, this.onRcvConnectedEvent);
    this.hub.on(HubEvents.RcvMyConnection, this.onRcvMyConnection);
    this.hub.on(HubEvents.RcvActiveClients, this.onRcvActiveClients);
    this.hub.on(HubEvents.RcvMessagesUpdateEvent, this.onRcvMessagesUpdateEvent);
    this.hub.on(HubEvents.RequestClientsUpdate, this.onRequestClientsUpdate);
    this.hub.on(HubEvents.RcvMyClientDto, this.onRcvMyClientDto);

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

    this.GetMyClientDto();
  }

  /**
   * Обработчик события RcvMyClientDto.
   * Получает с сервера объект текущего клиента и сохраняет его в списке активных клиентов в этом объекте.
   * Вызывает серверный метод SendActiveClientsList для получения 
   * списка всех активных клиентов, подключенных к хабу.
   * @param clientDto
   */
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

    let privateMessages = this.client.Messages.filter(f => f.MsgRoute == MessageRoute.Private);
    HubPage.addMessagesToPrivateChat(privateMessages);

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
   * Обработчик события RcvMessagesUpdateEvent.
   */
  onRcvMessagesUpdateEvent = (messages: IMessageDto[]) =>
  {
    messages.forEach(msg =>
    {
      let foundMsg = this.client.Messages.find(f => f.Id === msg.Id);
      foundMsg.Status = msg.Status;
      foundMsg.ReadOn = msg.ReadOn;
    });

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
   * Вызов серверного метода GetMyClientDto.
   * @returns
   */
  GetMyClientDto = () => this.hub.invoke(HubMethods.GetMyClientDto);

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
    this.hub.invoke(HubMethods.PublishCommonMessage, text);
  }


  CreatePrivateMessage(receiverId: number, receiverCid: string, text: string)
  {
    this.hub.invoke(HubMethods.PublishPrivateMessage, receiverId, receiverCid, text);
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

  /**
   * Возвращает список идентификаторов непрочтенных на клиенте сообщений,
   * которые нужно передать на сервер для изменения их статуса на "прочтенные".
   * @returns
   */
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

  /**
   * Возвращает признак наличия сообщений в приватном чате между текущим клиентом
   * и клиентом с указанным идентификатором.
   * @param clientId
   * @returns
   */
  hasPrivateMessagesWith = (clientId: number): boolean =>
  {
    return this.clientsMessages.some(s => s.MsgRoute == MessageRoute.Private && (s.SenderId == clientId || s.ReceiverId == clientId));
  }




  /**
   * Метод для проброса ссылки на компонент Blazor, метод которого должен быть вызван из JS.
   * @param prop
   * @param value
   */
  static setDotNetHelper(prop, value)
  {
    HubPage[prop] = value;
  }



  /**
   * Вызов метода UpdateSendBtnText компонента Home.
   * @param clientId
   * @param clientName
   * @param clientCid
   */
  static async updateSendButtonText(clientId: number, clientName: string, clientCid: string)
  {
    await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateSendBtnText, clientId, clientName, clientCid);
  }

  /**
   * Вызов метода UpdateClientsList компонента Home.
   */
  static async updateClientsList(clients: IServiceClientDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateClientsList, clients);
  }

  /**
   * Вызов метода UpdateClientInfo компонента Home.
   */
  static async updateClientInfo(client: IServiceClientDto)
  {
    await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateClientInfo, client);
  }

  /**
   * Вызов метода AddMessages компонента Home.
   * @param messages
   */
  static async addMessagesToCommonChat(messages: IMessageDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.AddMessages, messages);
  }

  /**
   * Вызов метода AddPrivateMessages компонента Home.
   * @param messages
   */
  static async addMessagesToPrivateChat(messages: IMessageDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.AddPrivateMessages, messages);
  }

  /**
   * Вызов метода UpdateMessages компонента Home.
   * @param messages
   */
  static async markCommonChatMessagesAsRead(messages: IMessageDto[])
  {
    await HubPage.dotNetHelper.invokeMethodAsync(DotNetMethods.UpdateMessages, messages);
  }

}


globalThis.HUBPAGE = new HubPage();
