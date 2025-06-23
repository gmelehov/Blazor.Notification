using Blazor.Notification.Models;
using Blazor.Notification.Models.Dtos;
using Blazor.Notification.Models.Enums;
using Blazor.Notification.Services;
using Blazor.Notification.SignalR.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;


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

    return ret;
  }


  /// <summary>
  /// <para>Запрос на отправку вызвавшему посетителю данных о текущем подключении.</para>
  /// </summary>
  /// <returns></returns>
  public async Task GetMyConnection() => await Clients.Caller.RcvMyConnection(_hubContextService.GetCurrentConnection(Context));


  public async Task GetMyClientDto() => await Clients.Caller.RcvMyClientDto(_hubContextService.GetCurrentClientDto(Context));

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
  }

  /// <summary>
  /// Запрос на отправку списка всех подключенных в настоящий момент клиентов.
  /// </summary>
  /// <returns></returns>
  public async Task SendActiveClientsList()
  {
    var clients = _hubContextService.GetActiveClientDtos();
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

}
