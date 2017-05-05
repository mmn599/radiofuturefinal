using RadioFutureFinal.Contracts;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Models;
using RadioFutureFinal.Search;
using System.Threading.Tasks;

namespace RadioFutureFinal.Messaging
{
    public class MessageReceiver : IActionsServer
    {
        IMyContext _myContext;
        IDbRepository _db;
        IActionsClient _sender;
        Searcher _searcher;

        public MessageReceiver(IDbRepository db, IMyContext myContext, MessageSenderFactory senderFactory, Searcher searcher)
        {
            _myContext = myContext;
            _db = db;
            _sender = senderFactory.Create(_myContext.SocketDisconnected);
            _searcher = searcher;
        }

        // TODO: significant bug where additional session is created with same name if two request are made in similar times. I may have fixed it
        // TODO: WsMessage shouldn't be same for every message
        public async Task JoinSession(MySocket socket, string sessionName)
        {
            Session session = null;
            bool sessionFound = _db.GetSessionByName(sessionName, out session);
            if(!sessionFound)
            {
                session = await _db.CreateSessionAsync(sessionName);
            }
            var userName = "Anonymous";
            var user = await _db.AddNewUserToSessionAsync(userName, session);

            var sessionId = session.SessionID;

            _myContext.SocketJoinSession(socket, sessionId, user.MyUserId);

            var sessionV1 = session.ToContract();
            await _sender.clientSessionReady(sessionV1, user.ToContract(), socket);
            await _sender.clientUpdateUsersList(sessionV1.Users, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task AddMediaToSession(MySocket socket, MediaV1 media)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.AddMediaToSessionAsync(media.ToModel(), sessionId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task DeleteMediaFromSession(MySocket socket, int mediaId)
        {
            var sessionId = socket.SessionId;
            var updatedSession = await _db.RemoveMediaAsync(sessionId, mediaId);
            await _sender.clientUpdateQueue(updatedSession.ToContract().Queue, _myContext.GetSocketsInSession(sessionId));
        }

        // TODO: don't use whole session
        public async Task SaveUserNameChange(MySocket socket, int userId, string newName)
        {
            await _db.UpdateUserNameAsync(userId, newName);
            var sessionId = socket.SessionId;
            var session = _db.GetSession(sessionId);
            await _sender.clientUpdateUsersList(session.ToContract().Users, _myContext.GetSocketsInSession(sessionId));
        }

        public async Task ChatMessage(MySocket socket, string chatMessage, string userName)
        {
            await _sender.clientChatMessage(chatMessage, userName, _myContext.GetSocketsInSession(socket.SessionId));
        }

        public async Task RequestSyncWithUser(MySocket socket, int userIdRequestee)
        {
            var userIdRequestor = socket.UserId;
            var socketRequestee = _myContext.GetSocketForUser(socket.SessionId, userIdRequestee);
            await _sender.clientRequestUserState(userIdRequestor, socketRequestee);
        }

        public async Task ProvideSyncToUser(MySocket socket, UserState userState, int userIdRequestor)
        {
            var socketToSendTo = _myContext.GetSocketForUser(socket.SessionId, userIdRequestor);
            await _sender.clientProvideUserState(userState, socketToSendTo);
        }

        public async Task Search(MySocket socket, string query, int page)
        {
            var searchResults = await _searcher.searchPodcasts(query, page);
            await _sender.clientSearchResults(searchResults, socket);
        }

    }
}
