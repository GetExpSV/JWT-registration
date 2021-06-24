import React, {FC} from 'react'

type TestType = {
    name: string,
    func: (val: number) => void,
    number: number
}

const Test1: FC<TestType> = (values: TestType) =>{
    return(
        <div>
            <div>Имя:
                {values.name}
            </div>
            <div>Номер:
                {values.number}
            </div>
            <div>
                <button onClick={(e)=> values.func(values.number)}>Button</button>
            </div>
        </div>
    )
}

export default Test1;