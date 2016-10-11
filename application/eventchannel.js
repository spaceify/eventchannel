#!/usr/bin/env node
/**
 * app-lightcontrol, 6.10.2016 Spaceify Oy
 *
 * @class EventChannel
 */

var spaceify = require("/api/spaceifyapplication.js");

function EventChannel()
{
var self = this;

var listeners = new Array();
var listenersByName = new Object();

// EXPOSED JSON-RPC METHODS -- -- -- -- -- -- -- -- -- -- //

// Adds and EventListener that gets triggered every time an event that matches the eventFilter
// is generated. When the EventListener is triggered, the RPC function with callbackName
// should be called on the application that added this event listener.

self.addEventListener = function(eventFilter, callbackName, callObj)
	{
	var listener = {filter: eventFilter, connectionId: callObj.callerId, callbackName};
	listeners.push(listener);
	listenersByName = [eventFilter.name] = [listener];
	};


// Generates (= emits) event on this eventChannel. Triggers all eventListeners, the filter of
// which matches the eventObject

self.generateEvent = function(eventObject)
	{
	// Find mathcing eventListeners for this eventObject

	// Implement first exact matching of the event name,
	// More complex filters will be added later!

	if (listenersByName.hasOwnProperty(eventObject.name))
	 	{
		var lis = listenersByName[eventObject.name];

		for (var i = 0; i < lis.length; i++ )
			{
			communicator.callRpc(lis[i].callbackName, [eventObject], lis[i].connectionId);		//!!!!! TODO make this really work!
			}
		}
	};


	// Remember to IMPLEMENT start AND fail METHODS IN YOUR APPLICATION!!! -- --  -- -- //
self.start = function()
	{
	// PROVIDED - CONNECTIONS FROM CLIENTS TO US
	var service = spaceify.getProvidedService("spaceify.org/services/eventchannel");

	service.exposeRpcMethod("addEventListener", self, self.addEventListener);
	service.exposeRpcMethod("generateEvent", self, self.generateEvent);
	};

self.fail = function()
	{
	};

}

var eventChannel = new EventChannel();
spaceify.start(eventChannel, {webservers: {http: true, https: true}});
