import React from 'react'
import Card from '../components/Card'
import CardTwo from '../components/CardTwo'
import DisplayCard from '../components/DisplayCard'
import CircleCard from '../components/CircleCard'
import ScratchCard from 'react-scratchcard'
import fill_circle_01 from "../public/fill_circle_01.svg"
const App = () => {
  const settings={
    width:350,
    height:350,
    image:fill_circle_01,
    finishPercent:50,
    onComplete:()=>console.log("the card is now clear")
  }
  return (
    <div className='flex justify-center items-center gap-5' >
      {/* <Card/>
      <CardTwo/> */}
      {/* <DisplayCard/> */}
      <CircleCard/>
    {/* <ScratchCard {...settings}>
      <img src='/image.jpg'/>
    // </ScratchCard> */}
    </div>
  )
}

export default App
