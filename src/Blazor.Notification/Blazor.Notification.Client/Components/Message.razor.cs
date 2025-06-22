using Blazor.Notification.Models.Enums;
using Microsoft.AspNetCore.Components;


namespace Blazor.Notification.Client.Components;


public class MessageVM : ComponentBase
{


  [Parameter]
  public int Id { get; set; }


  [Parameter]
  public int MessageId { get; set; }


  [Parameter]
  public string SenderName { get; set; }


  [Parameter]
  public string ReceiverCid { get; set; }


  [Parameter]
  public int ReceiverId { get; set; }


  [Parameter]
  public DateTime CreatedOn { get; set; }


  [Parameter]
  public DateTime? ReadOn { get; set; }


  [Parameter]
  public string Text { get; set; }


  [Parameter]
  public MessageStatus Status { get; set; }


  [Parameter]
  public MessageRoute MsgRoute { get; set; }



}
