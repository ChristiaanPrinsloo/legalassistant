import React from 'react';

const Loading = (prop) => {
  console.log(prop['arg'])
    return (
        <div className={ prop['arg'] === 'confirmed'? "bouncing-loader pt-10 pb-2" : "bouncing-loader-host pt-10 pb-2"}>
          <div></div>
          <div></div>
          <div></div>
        </div>
    );
  }
  

export default Loading;