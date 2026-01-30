import { ReactNode } from "react";

export function IconButton({
    icon, onclick, activated
}: {
    icon: ReactNode,
    onclick: () => void,
    activated: boolean 
}){
    return <div className={`m-2 pointer rounded-full border p-2 bg-black hover:bg-gray ${activated ? "text-red-400" : "text-white" }`} onClick={onclick}>
        {icon}
    </div>
}