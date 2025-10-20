
import ClientSlider from "./slidercomponent";
// import AboutText from './aboutrahim';


function Portfolio() {


  return (
    <div className=" w-full  flex flex-col items-center justify-center text-center  overflow-hidden bg-[#FEFDF8] py-10 sm:py-14 md:py-16 lg:py-10  " >
    <div className="w-[1300px]  ">
    <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
          {"{ Portfolio }"}
        </h2>
<ClientSlider />
    </div>
  
    </div>
  )
}

export default Portfolio