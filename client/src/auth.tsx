import React, { useEffect, useState } from "react";
import { url } from "./consts";

interface IPanelProps {
    onClose: (pageName:string)=>void;
}

export function Auth({onClose}: IPanelProps){
    const [name, setName] = useState('');
    const [pass, setPass] = useState('');   
    const auth = ()=>{
        fetch(`${url}/login?name=${name}&password=${pass}`).then(res=>res.json()).then(data => {
            console.log(data);
            //setSelected(null);
            if (data.status!= 'null' && data.status!=null){
                localStorage.setItem('session', data.status);
                onClose('panel');
            }
        })
    }

    return <div>
        <label htmlFor="nameInput"> login: </label>
        <input type="text" id="nameInput" value = {name} onChange={(e)=>{
            setName(e.target.value)
        }}></input>
        <label htmlFor ="passInput">password:</label>
        <input type="text" id="passInput" value = {pass} onChange={(e)=>{
            setPass(e.target.value)
        }}></input>
        <button onClick={()=>{
            auth();
        }}>login</button>

        <button onClick={()=>{
            fetch(`${url}/register?name=${name}&password=${pass}`).then(res=>res.json()).then(data => {
                console.log(data);
                auth();
            })
        }}>register</button>
    </div>
}