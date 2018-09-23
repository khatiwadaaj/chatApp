const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;



//Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat',{ useNewUrlParser: true }, function(err, db){
    if(err){
        throw err;
    }
    console.log('MongoDB connected...');

    //connect to socket.io

    client.on('connection', function(){
        let chat = db.collection('chats');

        //create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        //Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
            if (err){
                throw err;
            }

            // emit the messages
            socket.emit('output', res);
        });

        //Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            //check for name and message
            if (name == '' || message ==''){

                sendStatus('Please enter a name and message.')
            } else {
                //Insert message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    //Send status object
                    sendStatus({
                        message: 'Message Sent',
                        clear: true
                    });
                });
            }
        });

        //Handle clear
        socket.on('clear', function(){
            //Remove all chats from collection
            chat.remove({}, function(){
                //Emit cleared message
                socket.emit('Cleared');
            });
        });

    });
});