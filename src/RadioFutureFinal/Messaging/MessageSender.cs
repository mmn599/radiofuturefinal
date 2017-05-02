using RadioFutureFinal.Contracts;
using RadioFutureFinal.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageSender : IMessageSender
    {
        IMessageSenderBase _senderBase;

        public MessageSender(IMessageSenderBase senderBase)
        {
            _senderBase = senderBase;
        }
            
        public async Task<SendResult> ClientSessionReady(MySocket socket, Session session, MyUser user)
        {
            // TODO: How can I make sure this is somewhat updated properly?
            var wsMessage = new WsMessage();
            wsMessage.Action = "clientSessionReady";
            wsMessage.Session = session.ToContract(); 
            wsMessage.User = user.ToContract();

            return await _senderBase.SendMessageAsync(socket.WebSocket, wsMessage);
        }

        public async Task<SendResult> ClientRequestUserState(int userIdRequestor, int userIdRequestee, MySocket userSocket)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = "clientRequestUserState";
            wsMessage.User = new MyUserV1();
            wsMessage.User.Id = userIdRequestor;

            return await _senderBase.SendMessageAsync(userSocket.WebSocket, wsMessage);
        }

        public async Task<SendResult> ClientProvideUserState(MyUserV1 userInfo, MySocket userToSendTo)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = "clientProvideUserState";
            wsMessage.User = userInfo;
            wsMessage.User.Id = -1; // TODO: this is because of crappy message system

            return await _senderBase.SendMessageAsync(userToSendTo.WebSocket, wsMessage);
        }

        public async Task<SendResult> ClientSearchResults(MySocket userToSendTo, List<MediaV1> searchResults)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = "clientSearchResults";
            // TODO: dumb
            wsMessage.Session = new SessionV1();
            wsMessage.Session.Queue = searchResults;
            return await _senderBase.SendMessageAsync(userToSendTo.WebSocket, wsMessage);
        }


        public async Task<SendResult> ClientSetupYTAPI(MySocket socket, string secret)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = "clientSetupYTAPI";
            // TODO: dumb
            wsMessage.Media = new MediaV1() { Title = secret };
            return await _senderBase.SendMessageAsync(socket.WebSocket, wsMessage);
        }

        public async Task<SendResult> ClientSetupAudioAPI(MySocket socket, string id, string secret)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = "clientSetupAudioAPI";
            // TODO: dumb
            wsMessage.User = new MyUserV1() { Name = id };
            wsMessage.Media = new MediaV1() { Title = secret };
            return await _senderBase.SendMessageAsync(socket.WebSocket, wsMessage);
        }

        private async Task<List<SendResult>> ClientsUpdateSession(Session session, string action, List<MySocket> socketsInSession)
        {
            var wsMessage = new WsMessage();
            wsMessage.Action = action;
            wsMessage.Session = session.ToContract();
            return await _senderBase.SendMessageToSessionAsync(wsMessage, socketsInSession);
        }

        // TODO: don't use full WsMessage
        public async Task<List<SendResult>> ClientsSendChatMessage(WsMessage message, List<MySocket> socketsInSession)
        {
            message.Action = "clientChatMessage";
            return await _senderBase.SendMessageToSessionAsync(message, socketsInSession);
        }

        //TODO: probably shouldn't be sending full session for user and queue updates
        public async Task<List<SendResult>> ClientsUpdateSessionUsers(Session session, List<MySocket> socketsInSession)
        {
            return await ClientsUpdateSession(session, "clientUpdateUsersList", socketsInSession);
        }

        public async Task<List<SendResult>> ClientsUpdateSessionQueue(Session session, List<MySocket> socketsInSession)
        {
            return await ClientsUpdateSession(session, "clientUpdateQueue", socketsInSession);
        }
    }
}
