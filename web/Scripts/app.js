var ws;
var host = "ws://localhost:8181/chat";
var objects = {};
var model = [
{ name: "EUR/USD" }, { name: "EUR/CHF" }, { name: "EUR/JPY" }, { name: "EUR/CAD" }, { name: "EUR/XXX" }];
$(function () {
	var elems = $('tbody tr');

	for (var i = 0; i < elems.length; i++) {
		var item = $(elems[i]);
		var name = item.find('td').first().text();
		objects[name] = item;
	}

	if ("WebSocket" in window) {
		debug("Browser supports web sockets!", 'success');
		connect(host);
	} else {
		debug("Browser does not support web sockets", 'error');
	};

	// function to send data on the web socket
	function ws_send(str) {
		try {
			ws.send(str);
		} catch (err) {
			debug(err, 'error');
		}
	}

	// connect to the specified host
	function connect(host) {

		debug("Connecting to " + host + " ...");
		try {
			ws = new WebSocket(host);
		} catch (err) {
			debug(err, 'error');
		}

		ws.onopen = function () {
			debug("connected... ", 'success');
		};

		ws.onmessage = function (evt) {
			var s = evt.data.split('|');
			if (s.length == 3) {
				var obj = {
					name: s[0]
				};
				if (s[2] == 'buy')
					obj.buy = parseFloat(s[1].replace(',','.'));
				else
					obj.sell = parseFloat(s[1].replace(',', '.'));
				changeValue.call(obj);
			}
			debug(evt.data, 'response');
		};

		ws.onclose = function () {
			debug("Socket closed!", 'error');
		};
	};

	function changeValue() {
		for (var i = 0; i < model.length; i++) {
			if (model[i].name == this.name) {
				var item = objects[this.name] || createItem.call(model[i]);
				if (this.buy) {
					var color = model[i].buy > this.buy ? "red" : "green";
					model[i].buy = this.buy;
					
					item.find('td[data-name=buy]').text(this.buy.toFixed(4)).css('color', color);
				}
				else {
					var color = model[i].buy > this.sell ? "red" : "green";
					model[i].sell = this.sell;
					item.find('td[data-name=sell]').text(this.sell.toFixed(4)).css('color',color);
				}
				return;
			}
		}
		var m = { name: this.name, buy: this.buy || 0, sell: this.sell || 0 };
		model.push();
		createItem.call(m);
	}

	function createItem() {
		var item = $('<tr><td data-name="name">' + this.name + '</td><td data-name="buy">' + (this.buy || 0).toFixed(4) + '</td><td data-name="sell">' + (this.sell || 0).toFixed(4) + '</td></tr>');
		$('tbody').append(item);
		objects[this.name] = item;
		return item;
	}


	function debug(msg, type) {
		console.log(msg);
	};


});