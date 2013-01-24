using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebSocketChatServer
{
	using System.Threading;
	using WebSocketServer;

	class ChatServer
	{
		WebSocketServer wss;

		private int count = 0;

		public Dictionary<string, double> cots = new Dictionary<string, double>() 
		{ 
			{"EUR/USD", 1.434}, {"EUR/CHF", 1.23}, {"EUR/JPY", 119.19}, {"EUR/CAD", 1.33}, {"EUR/XXX", 1.111}
		};

		public ChatServer()
		{
			wss = new WebSocketServer(8181, "http://localhost:8080", "ws://localhost:8181/chat");
			wss.Logger = Console.Out;
			wss.LogLevel = ServerLogLevel.Subtle;
			wss.ClientConnected += new ClientConnectedEventHandler(OnClientConnected);
			wss.Start();
			object obj = new object();
			for (int i = 0; i < cots.Count; i++)
			{
				var id = i;
				Thread thread = new Thread(delegate()
				{
					this.StartSending(id);
				});
				thread.Start();
			};

			KeepAlive();
		}

		private void KeepAlive()
		{
			string r = Console.ReadLine();
			while (r != "quit")
			{
				r = Console.ReadLine();
			}
		}

		void OnClientConnected(WebSocketConnection sender, EventArgs e)
		{
			//.Add(new User() { Connection = sender });
			//sender.Disconnected += new WebSocketDisconnectedEventHandler(OnClientDisconnected);
			//sender.DataReceived += new DataReceivedEventHandler(OnClientMessage);
		}

		private void StartSending(int idx)
		{
			Random rand = new Random();
			var elem = cots.ElementAt(idx).Key;
			if (elem == null)
			{
				count++;
				return;
			}
			while (true)
			{
				var delay = rand.Next(500, 1000);
				Thread.Sleep(delay);
				var value = (rand.NextDouble() - 0.437) / 100;
				cots[elem] += value;
				var buy = rand.Next(0, 10) > 5;
				wss.SendToAll(elem + '|' + cots[elem].ToString() + '|' + (buy ? "buy" : "sell"));
			}
		}

	}
}
