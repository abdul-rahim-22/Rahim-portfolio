
import ClientSlider from "./slidercomponent";
// import AboutText from './aboutrahim';


function Portfolio() {


  return (
    <div  id="work"  className=" w-full  flex flex-col items-center justify-center text-center  overflow-hidden bg-[#FEFDF8] py-5 sm:py-5 md:py-5 lg:py-5  " >
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