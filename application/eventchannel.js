#!/usr/bin/env node
/**
 * EventChannel, 22.10.2016 Spaceify Oy
 *
 * @class EventChannel
 */

var spaceify = require("/api/spaceifyapplication.js");

function EventChannel()
{
var self = this;

var eventChannelService;

var listeners = new Array();
var listenersByEventName = new Object();

// EXPOSED JSON-RPC METHODS -- -- -- -- -- -- -- -- -- -- //


self.onClientDisconnected = function(connectionId)
	{
	for(var name in listenersByEventName)										// Go through all the listener by event name
		{
		for(var i = listenersByEventName[name].length - 1; i >= 0; i--)			// and try to find the listeners with the connectionId
			{
			if(listenersByEventName[name][i].connectionId == connectionId)
				listenersByEventName[name].splice(i, 1);
			}

		if(listenersByEventName[name].length == 0)								// Delete empty listener objects
			delete listenersByEventName[name];
		}

	for(var i = listeners.length - 1; i >= 0; i--)								// Delete the listeners from here too						
		{
		if(listeners[i].connectionId == connectionId)
			listeners.splice(i, 1);
		}
	}

// Adds and EventListener that gets triggered every time an event that matches the eventFilter
// is generated. When the EventListener is triggered, the RPC function with callbackName
// should be called on the application that added this event listener.

self.addEventListener = function(eventFilter, callbackName, callObj, callback)
	{	
	var listener = {filter: eventFilter, connectionId: callObj.connectionId, callbackName: callbackName};

	// ToDo: check duplicates?

	listeners.push(listener);

	// listenersByEventName = [eventFilter.name] = [listener]; ???
	if(!listenersByEventName.hasOwnProperty(eventFilter.name))					// Multiple clients can listen to the same event
		listenersByEventName[eventFilter.name] = [];
	listenersByEventName[eventFilter.name].push(listener);

	callback(null,"Ok");
	};

// Generates (= emits) event on this eventChannel. Triggers all eventListeners, the filter of
// which matches the eventObject

self.generateEvent = function(eventObject, callObj, callback)
	{
	// Find mathcing eventListeners for this eventObject

	// Implement first exact matching of the event name,
	// More complex filters will be added later!

	console.log("generateEvent");
	console.log(eventObject);
	console.log(callObj);
	console.log(callback);

	if (listenersByEventName.hasOwnProperty(eventObject.name))
		{
		var lis = listenersByEventName[eventObject.name];

		for (var i = 0; i < lis.length; i++)
			{
			// Clients connect to our provided service. Clients can be called individually by using their connectionId.
			eventChannelService.callRpc(lis[i].callbackName, [eventObject], null, null, lis[i].connectionId);
			}
		}
		
	callback(null, "Ok");
	};

	// Remember to IMPLEMENT start AND fail METHODS IN YOUR APPLICATION!!! -- -- -- -- //
self.start = function()
	{
	// PROVIDED - CONNECTIONS FROM CLIENTS TO US
	console.log("EventChannel::start()");
	eventChannelService = spaceify.getProvidedService("spaceify.org/services/eventchannel");
	console.log("EventChannel::start() got provided service");
	
	eventChannelService.exposeRpcMethod("addEventListener", self, self.addEventListener);
	eventChannelService.exposeRpcMethod("generateEvent", self, self.generateEvent);
	console.log("EventChannel::start() rpc methods exposed");
	
	eventChannelService.setDisconnectionListener(self.onClientDisconnected);
	console.log("EventChannel::start() end");
	};

self.fail = function()
	{
	};

}

var eventChannel = new EventChannel();
spaceify.start(eventChannel, {webservers: {http: true, https: true}});
