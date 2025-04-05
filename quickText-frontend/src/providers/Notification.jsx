import React from "react";
import { toast } from "react-toastify";

const NotificationContext=React.createContext(null);

export const useNotification=()=>{
    return React.useContext(NotificationContext);
}

export const NotificationProvider=(props)=>{
      const notifyMistakes = (message) => {
        toast.error(message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      };
    
      const notifySuccess = (message) => {
        toast.success(message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      };
    return(
        <NotificationContext.Provider value={{notifyMistakes,notifySuccess}}>
            {props.children}
        </NotificationContext.Provider>
    )
}