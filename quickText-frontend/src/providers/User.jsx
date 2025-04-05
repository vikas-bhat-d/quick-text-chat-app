import React, { useState } from "react";

const UserContext = React.createContext(null);

export const useUser = () => {
  return React.useContext(UserContext);
};

export const UserProvider = (props) => {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
};
