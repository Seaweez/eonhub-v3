import { eonhubApiCreate } from '@/axios';
import UserService from '@/services/user.service';
import { IEonUserDetail } from '@/types/eonhub';
import axios from 'axios'
import React from 'react'
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify'

interface SupportTicketProps {
  // ticketId: string;
  // subject: string;
  // description: string;
  // status: string;
}

const SupportTicket: React.FC<SupportTicketProps> = (
  {
    // ticketId,
    // subject,
    // description,
    // status,
  },
) => {

    
  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);
  const userService = new UserService();
  
  const [ticketData, setTicketData] = React.useState({
    title: '',
    description: '',
    serverName: '',
    playerName: '',
    issue: '',
    priority: '',
    date: '',
    contact:'',
  })
const [isSubmitting, setIsSubmitting] = React.useState(false);

const generateTicketCard = async () => {
    // Generate the ticket card data
    if (!ticketData.title || !ticketData.serverName || !ticketData.playerName || !ticketData.issue || !ticketData.date) {
        toast.error('Please fill all the required fields!');
        return;
    }

    // Create the ticket card message
    const ticketCardMessage = `
        [ New Support Ticket ]
         ---------------------
        Title: ${ticketData.title}
        Date: ${ticketData.date} 
        Issue: ${ticketData.issue} 
        
        ( Contact Player via: ${ticketData.contact} )

        [UID ${userCookie?.userId}] - ${userCookie?.email}
        Server Name: ${ticketData.serverName}
        Player Name: ${ticketData.playerName}
    `;

    // Send the ticket card message to Discord webhook
    try {
        setIsSubmitting(true); // Set isSubmitting to true to disable the submit button
        await axios.post(
            `https://discordapp.com/api/webhooks/1279772786813829140/r305ZMH9mc5g9o6qlZYJVARUSWdhu0DO7t3EEHHD3v8fGqMO2gQJZuwnCBylXErgZusG`,
            {
                content: '```' + ticketCardMessage + '```',
            },
        );
        toast.success('Ticket card sent successfully!');
        setIsSupportVisible(false);
        setTimeout(() => {
            setIsSubmitting(false); // Set isSubmitting back to false after 10 seconds
        }, 10000);
    } catch (error) {
        console.error('Failed to send ticket card:', error);
        setIsSubmitting(false); // Set isSubmitting back to false if there's an error
    }
};

// Rest of the code...

//   const generateTicketCard = async () => {
//     // Generate the ticket card data
//     if(!ticketData.title || !ticketData.serverName || !ticketData.playerName || !ticketData.issue || !ticketData.date) {
//         toast.error('Please fill all the required fields!')
//         return
//     }

//     // Create the ticket card message
//     const ticketCardMessage = `
//     [ New Support Ticket ]
//      ---------------------
//     Title: ${ticketData.title}
//     Date: ${ticketData.date}
//     Server Name: ${ticketData.serverName}
//     Player Name: ${ticketData.playerName}
//     Issue: ${ticketData.issue}
//   `
//     // const ticketCardMessage = `
//     //       **New Support Ticket**
//     //       **Title:** ${ticketData.title}
//     //       **Server Name:** ${ticketData.serverName}
//     //       **Player Name:** ${ticketData.playerName}
//     //       **Issue:** ${ticketData.issue}
//     //       **Priority:** ${ticketData.priority}
//     //       **Description:**
//     //       ${ticketData.description}
//     //     `

//     // Send the ticket card message to Discord webhook
//     try {
//       await axios.post(
//         `https://discordapp.com/api/webhooks/1279772786813829140/r305ZMH9mc5g9o6qlZYJVARUSWdhu0DO7t3EEHHD3v8fGqMO2gQJZuwnCBylXErgZusG`,
//         {
//           content: '```'+ticketCardMessage+'```',
//         },
//       )
//       toast.success('Ticket card sent successfully!')
//       setIsSupportVisible(false);
//     } catch (error) {
//       console.error('Failed to send ticket card:', error)
//     }
//   }

  const onSupportRequest = () => {
    // Call the function to generate and send the ticket card
    generateTicketCard()
  }

  const [isSupportVisible, setIsSupportVisible] = React.useState(false)
  const onSupportHideToggle = () => {
    // Call the function to generate and send the ticket card
    setIsSupportVisible(!isSupportVisible)
  }
  return (
    <div className={`support-ticket fixed bottom-3 left-3 z-10 ${userCookie?.email || `hidden`}`}>
      <div
        onClick={onSupportHideToggle}
        className="box-shadow-md cursor-pointer rounded-full border-4 bg-white p-2 transition-all   hover:scale-110 hover:bg-primary hover:font-semibold hover:text-white"
      >
        <h4>Request Supports</h4>
      </div>
      {isSupportVisible && (
        <div className={`absolute z-[100] mt-2 transition-all duration-300 ${isSupportVisible ? `-translate-y-[100%]` : ` `}`}>
          <div className="box-shadow-md cursor-pointer rounded-lg border-2 bg-white p-2 text-center transition-all">
            <h4 className={`font-bold my-2`}>Support Ticket</h4>
            <input
              type="text"
              placeholder="Title"
              value={ticketData.title}
              onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
            />
            {/* <input type="text" placeholder="Description" value={ticketData.description} onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })} /> */}
            <input
              type="text"
              placeholder="Server Name"
              value={ticketData.serverName}
              onChange={(e) => setTicketData({ ...ticketData, serverName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Character Name"
              value={ticketData.playerName}
              onChange={(e) => setTicketData({ ...ticketData, playerName: e.target.value })}
            />
            <textarea
              rows={4}
              placeholder="Issue"
              className='border-2 p-2 mt-2 rounded-md'
              value={ticketData.issue}
              onChange={(e) => setTicketData({ ...ticketData, issue: e.target.value })}
            />
            <input
                type="date"
                placeholder="Date"
                className='  rounded-md'
                value={ticketData.date}
                onChange={(e) => setTicketData({ ...ticketData, date: e.target.value })}
            />
            
            <input
              type="text"
              placeholder="How to Contact You"
              value={ticketData.contact}
              onChange={(e) => setTicketData({ ...ticketData, contact: e.target.value })}
            />
            {/* <input type="text" placeholder="Priority" value={ticketData.priority} onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })} /> */}
            <div className="1"> 
            <button className={`border-2 px-2 rounded bg-primary mt-2 text-white mr-1`} onClick={onSupportRequest}>Submit</button>  
         
            <button className={`border-2 px-2 rounded hover:bg-secondary mt-2 hover:text-white  `} onClick={onSupportHideToggle}>Cancel</button>
             </div>
          </div>
        </div>
      )}
      {/* <h3>Ticket ID: {`ticketId`}</h3>
            <h4>Subject: {`subject`}</h4>
            <p>Description: {`description`}</p>
            <p>Status: {`status`}</p> */}
    </div>
  )
}

export default SupportTicket
