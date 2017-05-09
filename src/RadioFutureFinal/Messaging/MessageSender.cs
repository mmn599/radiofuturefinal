using RadioFutureFinal.Contracts;
using RadioFutureFinal.Models;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Threading.Tasks;
using System.Reflection;
using System;
using System.Dynamic;
using RadioFutureFinal.Errors;

namespace RadioFutureFinal.Messaging
{
    public class MessageSender : IActionsClient
    {
        IMessageSenderBase _senderBase;

        public MessageSender(IMessageSenderBase senderBase)
        {
            _senderBase = senderBase;
        }

        public async Task clientProvideUserState(UserStateV1 userState, MySocket socket)
        {
            var json = _getJson("clientProvideUserState", userState);
            await _senderBase.SendMessageAsync(socket, json);
        }

        public async Task clientRequestUserState(int userIdRequestor, MySocket socket)
        {
            var json = _getJson("clientRequestUserState", userIdRequestor);
            await _senderBase.SendMessageAsync(socket, json);
        }

        public async Task clientSearchResults(List<MediaV1> searchResults, MySocket socket)
        {
            var json = _getJson("clientSearchResults", searchResults);
            await _senderBase.SendMessageAsync(socket, json);
        }

        public async Task clientSessionReady(SessionV1 session, MyUserV1 user, MySocket socket)
        {
            var json = _getJson("clientSessionReady", session, user);
            await _senderBase.SendMessageAsync(socket, json);
        }

        public async Task clientUpdateQueue(List<MediaV1> queue, IEnumerable<MySocket> socketsInSession)
        {
            var json = _getJson("clientUpdateQueue", queue);
            await _senderBase.SendMessageToSessionAsync(socketsInSession, json);
        }

        public async Task clientUpdateUsersList(List<MyUserV1> users, IEnumerable<MySocket> socketsInSession)
        {
            var json = _getJson("clientUpdateUsersList", users);
            await _senderBase.SendMessageToSessionAsync(socketsInSession, json);
        }

        public async Task clientChatMessage(string message, string userName, IEnumerable<MySocket> socketsInSession)
        {
            var json = _getJson("clientChatMessage", message, userName);
            await _senderBase.SendMessageToSessionAsync(socketsInSession, json);
        }

        public async Task clientUserLoggedIn(int newUserId, string newUserName, MySocket socket)
        {
            var json = _getJson("clientUserLoggedIn", newUserId, newUserName);
            await _senderBase.SendMessageAsync(socket, json);
        }

        public async Task clientsUpdateUserName(int userId, string newName, IEnumerable<MySocket> socketsInSession)
        {
            var json = _getJson("clientsUpdateUserName", userId, newName);
            await _senderBase.SendMessageToSessionAsync(socketsInSession, json);
        }

        private string _getJson(string action, params object[] values)
        {
            var json = new ExpandoObject() as IDictionary<string, Object>;
            json.Add("action", action); 

            var methodInfo = GetType().GetMethod(action);
            var parameters = methodInfo.GetParameters();
            for(int i=0; i< values.Length; i++)
            {
                var parameter = parameters[i];
                var value = values[i];
                json.Add(parameter.Name, value);
            }

            return Newtonsoft.Json.JsonConvert.SerializeObject(json);
        }


    }
}
