using Blazor.Notification.Models.Dtos;
using Microsoft.AspNetCore.Components;


namespace Blazor.Notification.Client.Components;


public class ClientsListVM : ComponentBase
{


  [Parameter]
  public List<ServiceClientDto> ItemsList { get; set; } = [];

  [Parameter]
  public int SelectedClientId { get; set; }


  
  public void UpdateClients(IEnumerable<ServiceClientDto> serviceClients)
  {
    ItemsList = serviceClients.ToList();
    if (SelectedClientId > 0)
    {
      ItemsList.FirstOrDefault(f => f.Id == SelectedClientId).IsSelected = true;
    }
    StateHasChanged();
  }



  





  



}
