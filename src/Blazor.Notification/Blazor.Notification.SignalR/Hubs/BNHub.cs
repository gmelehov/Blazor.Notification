using Blazor.Notification.Models;
using Blazor.Notification.Models.Dtos;
using Blazor.Notification.Models.Enums;
using Blazor.Notification.Services;
using Blazor.Notification.SignalR.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;


namespace Blazor.Notification.SignalR.Hubs;

/// <summary>
/// Хаб SignalR.
/// </summary>
public class BNHub(AppDbContext appDbContext, IHubContextService hubContextService) : Hub<IHubClient>
{
  private readonly AppDbContext _appDbContext = appDbContext;
  private readonly IHubContextService _hubContextService = hubContextService;



  /// <summary>
  /// <inheritdoc />
  /// </summary>
  /// <returns></returns>
  public override async Task OnConnectedAsync()
  {
    var cid = Context.ConnectionId;

    /// Подключение к хабу только что установлено, создаем объект Connection
    /// и заполняем его всей доступной на этот момент информацией.
    var conn = new Connection
    {
      Cid = cid,
      IP = GetCallerRemoteIP(Context),
      StartedOn = DateTime.Now,
      IsActive = true,
      ConnectReason = ConnectReason.AfterStart,
    };


    //if (prevcid != null && cid != prevcid)
    //{
    //  var prev = _appDbContext.Connections.Where(w => w.Cid == prevcid).FirstOrDefault();
    //  prev.Close();
    //  prev.DisconnectReason = DisconnectReason.OnRefresh;
    //  _appDbContext.Connections.Update(prev);
    //  _appDbContext.SaveChanges();

    //  conn.Previous = prev;
    //  conn.ConnectReason = ConnectReason.AfterRefresh;
    //  conn.CallerId = prev.CallerId;
    //}



    _appDbContext.Connections.Add(conn);
    _appDbContext.SaveChanges();
    
    await base.OnConnectedAsync();

    /// Отправляем код подключения к хабу SignalR в клиентский браузер,
    /// из которого было инициировано это подключение.
    await Clients.Caller.RcvConnectedEvent(cid);
  }

  /// <summary>
  /// <inheritdoc />
  /// </summary>
  /// <param name="exception"><inheritdoc /></param>
  /// <returns></returns>
  public override async Task OnDisconnectedAsync(Exception exception)
  {
    var cid = Context.ConnectionId;
    var conn = _appDbContext.Connections.Where(f => f.Cid == cid).Include(i => i.Caller).ThenInclude(t => t.Connections).FirstOrDefault();

    conn.Close();
    _appDbContext.Connections.Update(conn);
    _appDbContext.SaveChanges();

    /// Если закрывамое подключение - последнее из активных подключений клиента...
    if (conn.Caller.ActiveConns == 0)
    {
      /// Устанавливаем причину закрытия этого подключения = закрытие браузера.
      conn.DisconnectReason = DisconnectReason.OnExit;
      _appDbContext.Connections.Update(conn);

      /// Записываем дату и время, когда этот клиент последний раз был подключен
      conn.Caller.LastOnlineOn = DateTime.Now;
      _appDbContext.ServiceClients.Update(conn.Caller);

      _appDbContext.SaveChanges();
    }

    ///// Удаляем объект подключения из всех браузеров всех посетителей сайта
    //await Clients.All.RemConnectedClient(cid, conn.CallerId.Value);

    await base.OnDisconnectedAsync(exception);
  }



  /// <summary>
  /// <para>Возвращает текстовое представление IP-адреса пользователя, открывшего подключение.</para>
  /// </summary>
  /// <param name="ctx"></param>
  /// <returns></returns>
  public string GetCallerRemoteIP(HubCallerContext ctx)
  {
    var ret = ctx?.GetHttpContext()?.Connection?.RemoteIpAddress?.ToString() ?? ctx?.GetHttpContext()?.Connection?.LocalIpAddress?.ToString();
    if (ret == "::1" || ret == "127.0.0.1")
    {
      ret = "localhost";
    }
    ;

    return ret;
  }



  /// <summary>
  /// <para>Транслирует идентификатор текущего подключения в браузер вызвавшего клиента.</para>
  /// <para>Обеспечивает отслеживание цепочки подключений после закрытия предыдущего подключения и открытия нового.</para>
  /// </summary>
  /// <returns></returns>
  public async Task RewriteActualCid() => await Clients.Caller.EnsureActualCid(Context.ConnectionId);

  /// <summary>
  /// <para>Запрос на отправку вызвавшему посетителю данных о текущем подключении.</para>
  /// </summary>
  /// <returns></returns>
  public async Task GetMyConnection() => await Clients.Caller.RcvMyConnection(_hubContextService.GetCurrentConnection(Context));


  public async Task GetMyClientDto() => await Clients.Caller.RcvMyClientDto(_hubContextService.GetCurrentClientDto(Context));

  /// <summary>
  /// <para>Запрос на отправку вызвавшему посетителю данных о его подключении.</para>
  /// </summary>
  /// <returns></returns>
  public async Task UpdateMyConnection() => await Clients.Caller.UpdMyConnection(_hubContextService.GetCurrentConnection(Context));


  /// <summary>
  /// Обновляет данные текущего подключения.
  /// </summary>
  /// <param name="pathname"></param>
  /// <param name="useragent"></param>
  /// <param name="prevcid"></param>
  /// <returns></returns>
  public async Task UpdateCallerInfo(string pathname, string useragent, string prevcid)
  {
    var cid = Context.ConnectionId;
    var conn = _appDbContext.Connections.Where(f => f.Cid == cid).Include(i => i.Caller).FirstOrDefault();
    var prevconn = _appDbContext.Connections.Where(f => f.Cid == prevcid).Include(i => i.Caller).FirstOrDefault();
    conn.UpdateInfo(pathname);
    conn.UpdatePrevConn(prevconn?.Id);

    _appDbContext.Connections.Update(conn);
    _appDbContext.SaveChanges();

    /// Если у текущего клиента существовало предыдущее подключение
    /// (например, клиент обновлял страницу браузера, получив новый ConnectionId от хаба)
    if (prevconn != null)
    {
      /// Устанавливаем причину закрытия предыдущего подключения = OnRefresh.
      /// Устанавливаем причину открытия текущего подключения = AfterRefresh.
      prevconn.DisconnectReason = DisconnectReason.OnRefresh;
      conn.ConnectReason = ConnectReason.AfterRefresh;
      conn.CallerId = prevconn.CallerId;

      prevconn.Close();

      _appDbContext.Connections.UpdateRange(prevconn, conn);
      _appDbContext.SaveChanges();
    }
    else if(!conn.CallerId.HasValue)
    {
      var serviceClient = new ServiceClient();
      _appDbContext.ServiceClients.Add(serviceClient);
      _appDbContext.SaveChanges();

      conn.Caller = serviceClient;
      conn.CallerId = serviceClient.Id;
      _appDbContext.Connections.Update(conn);
      _appDbContext.SaveChanges();
    }

    
    await Clients.Caller.RcvUpdatedPath(cid, prevcid);

    await Clients.AllExcept(cid).AddConnectedClient(cid, conn.Caller);
  }



  /// <summary>
  /// Запрос на отправку списка всех подключенных в настоящий момент клиентов.
  /// </summary>
  /// <returns></returns>
  public async Task SendActiveClientsList()
  {
    var clients = _hubContextService.GetActiveClientDtos();

    //foreach (var client in clients)
    //{
    //  var unreadMsgs = _appDbContext.MessageReceivers.Count(w => w.ReceiverId == client.Id && w.Status != MessageStatus.Read);
    //  client.UnreadCommonMsg = unreadMsgs;
    //}

    await Clients.Caller.RcvActiveClients(clients);
  }





  public async Task PublishCommonMessage(string text)
  {
    var caller = _hubContextService.GetCurrentCaller(Context);

    var message = new Message
    {
      CreatedOn = DateTime.Now,
      Type = MessageType.Client,
      MsgRoute = MessageRoute.Common,
      Text = text,
      SenderId = caller.Id,
    };

    var clients = _hubContextService.GetActiveClientDtos();

    foreach (var client in clients)
    {
      message.Receivers.Add(new MessageToClient
      {
        Status = MessageStatus.Sent,
        Message = message,
        ReceiverId = client.Id,
      });

    }

    _appDbContext.Messages.Add(message);
    _appDbContext.SaveChanges();

    clients = _hubContextService.GetActiveClientDtos();
    await Clients.All.RcvActiveClients(clients);

  }




  public async Task PublishPrivateMessage(int receiverId, string receiverCid, string text)
  {
    var caller = _hubContextService.GetCurrentCaller(Context);

    var message = new Message
    {
      CreatedOn = DateTime.Now,
      Type = MessageType.Client,
      MsgRoute = MessageRoute.Private,
      Text = text,
      SenderId = caller.Id,
    };

    caller.OutBox.Add(message);

    message.Receivers.Add(new MessageToClient
    {
      Message = message,
      Status = MessageStatus.Sent,
      ReceiverId = receiverId,
    });

    message.Receivers.Add(new MessageToClient
    {
      Message = message,
      Status = MessageStatus.Sent,
      ReceiverId = caller.Id,
    });

    _appDbContext.ServiceClients.Update(caller);
    _appDbContext.Messages.Add(message);
    _appDbContext.SaveChanges();

    await Clients.Clients([receiverCid, caller.ActiveConnCid]).RcvActiveClients(_hubContextService.GetActiveClientDtos());
  }





  





  /// <summary>
  /// <para>Запрос от клиента-получателя на изменение статуса сообщений клиента-отправителя.</para>
  /// </summary>
  /// <remarks>
  /// Выбирает все непрочтенные клиентом-получателем сообщения от клиента-отправителя,
  /// изменяет их статус и сообщает об этом клиенту, вызвавшему этот метод.
  /// </remarks>
  /// <param name="senderId">Идентификатор клиента-отправителя сообщений.</param>
  /// <returns></returns>
  public async Task MarkUnreadMessages(params int[] messageIds)
  {
    var receiver = _hubContextService.GetCurrentCaller(Context);
    var unreadMessages = _appDbContext.MessageReceivers
      .Where(w => w.Status != MessageStatus.Read && messageIds.Contains(w.Id))
      .Include(i => i.Receiver)
      .Include(i => i.Message)
      .ToList()
      ;

    unreadMessages.ForEach(f =>
    {
      f.Status = MessageStatus.Read;
      f.ReadOn = DateTime.Now;
      _appDbContext.MessageReceivers.Update(f);
    });

    _appDbContext.SaveChanges();

    var messageDtos = unreadMessages.Select(s => new MessageDto
    {
      Id = s.Id,
      MessageId = s.Message.Id,
      SenderId = s.Message.SenderId ?? 0,
      ReceiverId = s.ReceiverId,
      ReceiverCid = s.Receiver.ActiveConnCid,
      ReceiverName = s.Receiver.Name,
      SenderName = s.Message.Sender?.Name ?? "SYSTEM",
      Status = s.Status,
      MsgRoute = s.Message.MsgRoute,
      CreatedOn = s.Message.CreatedOn,
      ReadOn = s.ReadOn,
      Text = s.Message.Text,
    });

    await Clients.Caller.RcvMessagesUpdateEvent(messageDtos);
  }


  /// <summary>
  /// Запрос на создание нового сообщения от клиента.
  /// </summary>
  /// <param name="text">Текст сообщения.</param>
  /// <param name="receiverIds">Массив идентификаторов клиентов-получателей сообщения.</param>
  /// <returns></returns>
  public async Task CreateClientMessage(string text, params int[] receiverIds)
  {
    var sender = _hubContextService.GetCurrentCaller(Context);
    var message = new Message
    {
      CreatedOn = DateTime.Now,
      Type = MessageType.Client,
      Text = text,
      Sender = sender,
      SenderId = sender.Id,
    };

    /// Убираем из списка идентификаторов клиентов-получателей идентификатор
    /// текущего клиента-отправителя.
    var filteredReceiverIds = receiverIds?.Where(w => w != sender.Id).ToArray();

    /// Если в списке остался хотя бы один идентификатор, то это сообщение будем отправлять по личным чатам получателей.
    /// Если в списке не осталось ни одного идентификатора, то это сообщение будет отправлено в общий чат.
    message.MsgRoute = filteredReceiverIds.Any() ? MessageRoute.Private : MessageRoute.Common;


    foreach (var id in filteredReceiverIds)
    {
      var msgToClient = new MessageToClient
      {
        Status = MessageStatus.Sent,
        Message = message,
        ReceiverId = id,
      };

      message.Receivers.Add(msgToClient);
    }

    _appDbContext.Messages.Add(message);
    _appDbContext.SaveChanges();


  }


  public async Task CreateSystemMessage(string text)
  {
    var message = new Message
    {
      CreatedOn = DateTime.Now,
      Type = MessageType.System,
      MsgRoute = MessageRoute.Common,
      Text = text,
      SenderId = null
    };

    var clients = _hubContextService.GetActiveClientDtos();

    foreach(var client in clients)
    {
      message.Receivers.Add(new MessageToClient
      {
        Status = MessageStatus.Sent,
        Message = message,
        ReceiverId = client.Id,
      });
      
    }

    _appDbContext.Messages.Add(message);
    _appDbContext.SaveChanges();


    List<MessageDto> dtos = [];

    foreach(var client in clients)
    {
      var msg = message.Receivers.FirstOrDefault(f => f.ReceiverId == client.Id);
      var dto = new MessageDto
      {
        Id = msg.Id,
        MessageId = message.Id,
        SenderId = 0,
        ReceiverId = client.Id,
        ReceiverCid = client.Cid,
        SenderName = "SYSTEM",
        Status = msg.Status,
        MsgRoute = message.MsgRoute,
        CreatedOn = message.CreatedOn,
        ReadOn = null,
        Text = message.Text
      };
      dtos.Add(dto);

      await Clients.Client(client.Cid).RcvClientUpdate(client);
    }
  }






}
