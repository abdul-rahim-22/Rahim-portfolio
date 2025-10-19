import React from 'react'

function Portfolio2() {
    return (
        <div className='flex  flex-col justify-center items-center'>
            <h1 className='text-[36px] sm:text-[50px] md:text-[70px] font-extrabold leading-tight'>
                💫 Featured <span className='text-[#8e827c] '>work</span>
            </h1>
            <img src='https://cdn-icons-png.flaticon.com/512/8841/8841304.png' className='w-15 h-15'></img>
            
            <p className="text-[15px] sm:text-[17px] md:text-[18px] lg:text-[20px] leading-relaxed text-gray-700 max-w-[800px] mx-auto sm:pl-[10px] sm:pr-[10px]">
                We create innovative and purposeful designs that not only capture attention but also drive meaningful results.
            </p>
        </div>
    )
}

export default Portfolio2