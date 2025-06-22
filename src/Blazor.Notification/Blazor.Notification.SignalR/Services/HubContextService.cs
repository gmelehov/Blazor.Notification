using Blazor.Notification.Models;
using Blazor.Notification.Models.Dtos;
using Blazor.Notification.Models.Enums;
using Blazor.Notification.Services;
using Blazor.Notification.SignalR.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;


namespace Blazor.Notification.SignalR.Services;

/// <summary>
/// <para>Реализация сервиса для работы с контекстом текущего подключения.</para>
/// </summary>
public class HubContextService(AppDbContext appDbContext) : IHubContextService
{
  private readonly AppDbContext _appDbContext = appDbContext;




  /// <summary>
  /// <inheritdoc />
  /// </summary>
  /// <param name="ctx"></param>
  /// <returns></returns>
  public ServiceClient GetCurrentCaller(HubCallerContext ctx) =>
    _appDbContext.ServiceClients.Where(f => f.Id == GetCurrentConnection(ctx).CallerId).Include(i => i.Connections).AsNoTracking().FirstOrDefault();


  /// <summary>
  /// <inheritdoc/>
  /// </summary>
  /// <param name="ctx"></param>
  /// <returns></returns>
  public Connection GetCurrentConnection(HubCallerContext ctx) =>
    _appDbContext.Connections.Where(f => f.Cid == ctx.ConnectionId).Include(i => i.Caller).ThenInclude(t => t.InBox).ThenInclude(t => t.Message).AsNoTracking().FirstOrDefault();


  /// <summary>
  /// <inheritdoc />
  /// </summary>
  /// <returns></returns>
  public IEnumerable<ServiceClientDto> GetActiveClientDtos() => _appDbContext.ServiceClients.Include(i => i.Connections).Include(i => i.InBox).ThenInclude(t => t.Message).ThenInclude(t => t.Sender)
    .AsNoTracking()
    .AsEnumerable()
    .Where(w => w.IsOnline)
    .Select(s => new ServiceClientDto
    {
      Id = s.Id,
      Name = s.Name,
      Cid = s.ActiveConn.Cid,
      PrevCid = s.ActiveConn.PrevCid,
      UnreadCommonMsg = s.InBox.Count(cc => cc.Status != Models.Enums.MessageStatus.Read && cc.Message.MsgRoute == Models.Enums.MessageRoute.Common),
      Messages = s.InBox.Select(ss => new MessageDto
      {
        Id = ss.Id,
        MessageId = ss.MessageId,
        SenderId = ss.Message.SenderId ?? 0,
        ReceiverId = ss.ReceiverId,
        ReceiverCid = ss.Receiver.ActiveConnCid,
        ReceiverName = ss.Receiver.Name,
        SenderName = ss.Message.Sender?.Name ?? "SYSTEM",
        Status = ss.Status,
        MsgRoute = ss.Message.MsgRoute,
        CreatedOn = ss.Message.CreatedOn,
        ReadOn = ss.ReadOn,
        Text = ss.Message.Text,
      }).ToList(),
    });




  public ServiceClientDto GetCurrentClientDto(HubCallerContext ctx) => _appDbContext.ServiceClients
    .Where(w => w.Id == GetCurrentConnection(ctx).CallerId)
    .Include(i => i.Connections)
    .Include(i => i.InBox)
    .ThenInclude(t => t.Message)
    .ThenInclude(t => t.Sender)
    .AsNoTracking()
    .AsEnumerable()
    .Select(s => new ServiceClientDto
    {
      Id = s.Id,
      Name = s.Name,
      Cid = s.ActiveConn.Cid,
      PrevCid = s.ActiveConn.PrevCid,
      UnreadCommonMsg = s.InBox.Count(cc => cc.Status != MessageStatus.Read && cc.Message.MsgRoute == MessageRoute.Common),
      Messages = s.InBox.Select(ss => new MessageDto
      {
        Id = ss.Id,
        MessageId = ss.MessageId,
        SenderId = ss.Message.SenderId ?? 0,
        ReceiverId = ss.ReceiverId,
        ReceiverCid = ss.Receiver.ActiveConnCid,
        ReceiverName = ss.Receiver.Name,
        SenderName = ss.Message.Sender?.Name ?? "SYSTEM",
        Status = ss.Status,
        MsgRoute = ss.Message.MsgRoute,
        CreatedOn = ss.Message.CreatedOn,
        ReadOn = ss.ReadOn,
        Text = ss.Message.Text,
      }).ToList(),
    })
    .FirstOrDefault();





  public async Task<IEnumerable<string>> CreateBackgroundSystemMessage()
  {
    var clients = GetActiveClientDtos();
    var totalUnreadMessagesCount = clients.Sum(s => s.UnreadCommonMsg);
    var msgText = $"Количество подключенных клиентов - {clients.Count()}.";

    var message = new Message
    {
      CreatedOn = DateTime.Now,
      Type = MessageType.System,
      MsgRoute = MessageRoute.Common,
      Text = msgText,
      SenderId = null
    };

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

    return await Task.FromResult(clients.Select(s => s.Cid));
  }


  



}
