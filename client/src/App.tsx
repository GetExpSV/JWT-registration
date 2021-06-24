import './App.css';
import Test1 from "./Components/Test1";
import * as React from "react";

const App = () => {
    const handler = (n: number) =>{
        console.log(n)
    }
    return(
        <div>
            <Test1 name={'sam'} func={handler} number={2}/>
        </div>
    )
}

export default App;

