using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Blazor.Notification.Client.Components;


public class ClientInfoVM : ComponentBase
{


  [Parameter]
  public string Name { get; set; }

  [Parameter]
  public string ConnId { get; set; }

  [Parameter]
  public int? ClientId { get; set; }

  [Parameter]
  public bool IsSelected { get; set; }

  [Parameter]
  public bool IsCurrent { get; set; }

  [Parameter]
  public int UnreadCommonMsg { get; set; }


  [Parameter] 
  public EventCallback<int> OnClick { get; set; }






  public async Task HandleClickAsync(MouseEventArgs e)
  {
    if (!IsCurrent)
    {
      await OnClick.InvokeAsync(IsSelected ? 0 : (this.ClientId ?? 0));
    }
  }



}
