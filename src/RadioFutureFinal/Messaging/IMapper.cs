using Newtonsoft.Json.Linq;
using RadioFutureFinal.Contracts;
using System;
using System.Collections.Generic;
using static RadioFutureFinal.Messaging.MessageReceiver;

namespace RadioFutureFinal.Messaging
{
    public static class Mapper
    {

        public static Dictionary<string, ResponseFunction> BuildResponseFunctions(IActionsServer actions)
        {
            var _responseFunctions = new Dictionary<string, ResponseFunction>();

            // TODO: can probably use reflection or something fancier than all of this

            ResponseFunction resFunc = async delegate (MySocket socket, JObject json)
            {
                var sessionName = json.GetValue("sessionName").ToObject<string>();
                await actions.JoinSession(socket, sessionName);
            };
            _responseFunctions.Add("JoinSession", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var media = json.GetValue("media").ToObject<MediaV1>();
                await actions.AddMediaToSession(socket, media);
            };
            _responseFunctions.Add("AddMediaToSession", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var mediaId = json.GetValue("mediaId").ToObject<int>();
                await actions.DeleteMediaFromSession(socket, mediaId);
            };
            _responseFunctions.Add("DeleteMediaFromSession", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var userId = json.GetValue("userId").ToObject<int>();
                var newName = json.GetValue("newName").ToObject<string>();
                await actions.SaveUserNameChange(socket, userId, newName);
            };
            _responseFunctions.Add("SaveUserNameChange", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var userName = json.GetValue("userName").ToObject<string>();
                var chatMessage = json.GetValue("chatMessage").ToObject<string>();
                await actions.ChatMessage(socket, userName, chatMessage);
            };
            _responseFunctions.Add("ChatMessage", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var userIdRequestee = json.GetValue("userIdRequestee").ToObject<int>();
                await actions.RequestSyncWithUser(socket, userIdRequestee);
            };
            _responseFunctions.Add("RequestSyncWithUser", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var userIdRequestor = json.GetValue("userIdRequestor").ToObject<int>();
                var userState = json.GetValue("userState").ToObject<UserStateV1>();
                await actions.ProvideSyncToUser(socket, userIdRequestor, userState);
            };
            _responseFunctions.Add("ProvideSyncToUser", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var query = json.GetValue("query").ToObject<string>();
                var page = json.GetValue("page").ToObject<int>();
                await actions.Search(socket, query, page);
            };
            _responseFunctions.Add("Search", resFunc);

            resFunc = async delegate (MySocket socket, JObject json)
            {
                var oldUserId = json.GetValue("oldUserId").ToObject<int>();
                var fbUserId = json.GetValue("fbUserId").ToObject<Guid>();
                await actions.FbLogin(socket, oldUserId, fbUserId);
            };
            _responseFunctions.Add("FbLogin", resFunc);

            return _responseFunctions;
        }
    }
}