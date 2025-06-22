import { ConnectReason, DisconnectReason, MessageRoute, MessageStatus, MessageType } from "./enums";



export type AnyFunction<A = any> = (...input: any[]) => A;

export type AnyConstructor<A = object> = new (...input: any[]) => A;

export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;




/** Клиентское подключение */
export interface IConnection
{

  Id: number;

  Cid: string;

  UserAgent: string;

  IP?: string;

  StartedOn: Date;

  ClosedOn?: Date | null;

  IsActive: boolean;

  ConnectReason: ConnectReason;

  DisconnectReason: DisconnectReason;

  PrevId?: number | null;

  PrevCid: string;

  CallerId: number;

  Caller: IServiceClient;

}






/** Клиент */
export interface IServiceClient
{

  Id: number;

  Name: string;

  LastOnlineOn?: Date | null;

  IsOnline: boolean;

  ActiveConns: number;

  ActiveConnCid: string;

  OutBox: IMessage[];

  InBox: IMessageToClient[];

}





/** DTO-модель клиента */
export interface IServiceClientDto
{

  Id: number;

  Name: string;

  Cid: string;

  PrevCid: string;

  IsSelected: boolean;

  IsCurrent: boolean;

  UnreadCommonMsg: number;

  Messages: IMessageDto[];

}









/** Сообщение */
export interface IMessage
{

  Id: number;

  CreatedOn: Date;

  Type: MessageType;

  Route: MessageRoute,

  Text: string;

  SenderId?: number | null;

  Sender: IServiceClient;

  Receivers: IMessageToClient[];

}







/** Сообщение, отправленное одному или нескольким клиентам-получателям */
export interface IMessageToClient
{

  Id: number;

  Status: MessageStatus;

  ReadOn?: Date | null;

  MessageId: number;

  Message: IMessage;

  ReceiverId: number;

  Receiver: IServiceClient;

}






/** DTO-модель сообщения */
export interface IMessageDto
{

  Id: number;

  MessageId: number;

  SenderId: number;

  ReceiverId: number;

  ReceiverCid: string;

  ReceiverName: string;

  SenderName: string;

  Status: MessageStatus;

  MsgRoute: MessageRoute;

  CreatedOn: Date;

  ReadOn?: Date | null;

  Text: string;

}