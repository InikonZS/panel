import React, { useEffect, useState, createContext, useContext} from "react";
import "./style.css";
import { Panel } from "./panel";
import { Auth } from "./auth";

export default function App() {
  const [page, setPage]= useState<string>('auth');
  return <div>
        {page == 'panel' && <Panel
          onClose = {()=>{
           
          }}
        />}
        {page == 'auth' && <Auth
          onClose = {(pageName)=>{
            setPage(pageName);
          }}
        />}
  </div>
}