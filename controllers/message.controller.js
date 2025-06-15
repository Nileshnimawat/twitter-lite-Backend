import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { io, getRecieverSocketId } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const recieverId = req.params.id;
    const { message } = req.body;

     if (!senderId || !recieverId) {
      return res.status(400).json({
        success: false,
        message: "Both senderId and receiverId are required",
      });
    }
    let gotConversation = await Conversation.findOne({
      participants: { $all: [senderId, recieverId] },
    });

    if (!gotConversation) {
      gotConversation = await Conversation.create({
        participants: [senderId, recieverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      recieverId,
      message,
    });

    if (newMessage) {
      gotConversation.messages.push(newMessage._id);
    }

    await gotConversation.save();

    //SOCKET IO
    const recieverSocketId = getRecieverSocketId(recieverId);
    if(recieverSocketId){
      io.to(recieverSocketId).emit("new-message", newMessage);
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getMessage = async (req, res) => {
    try {
        const recieverId = req.params.id;
        const senderId = req.userId;
        const conversation = await Conversation.findOne({
            participants:{$all :[senderId, recieverId]}
        }).populate("messages");

        return res.status(200).json({
            success:true,
            message:"message retrived successfully",
            Messages : conversation?.messages
        })

    } catch (error) {
        console.log(error)
         return res.status(500).json({
            success:true,
            message:"internal server error",

        })
    }
}