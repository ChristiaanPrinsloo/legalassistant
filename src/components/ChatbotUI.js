import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Loading from './Loading';
import { AddTime } from './AddTime';
import Draggable from 'react-draggable';
import { DraggableCore } from 'react-draggable';
import ContentEditable from 'react-contenteditable';
import ReactHeight from 'react-height';

const ChatbotUI = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [startRef, setStartRef] = useState(0);
  const [botMetadata, setBotMetadata] = useState("")
  const [characterCount, setCharacterCount] = useState(0);
  const [characterLimitReached, setCharacterLimitReached] = useState(false);
  const [divHeights, setDivHeights] = useState([]);
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHoverable, setisHoverable] = useState(true)
  const [height, setHeight] = useState();
  const [currentRow, setCurrentRow] = useState(-1);
  const [bandaidArray, setBandaidArray] = useState([6])

  const divHeightsRef = useRef([]);
  const draggableRef = useRef(null);
  const uiRef = useRef();
  
  let nextMetaIndex = 0;

  const userEmail = localStorage.getItem('userEmail');
  const token = localStorage.getItem('token');

  const maxCharacters = 350;

  console.log(messages)

//adds event listeners to markdown buttons
  useEffect(() => {
    const handleButtonClick = (event) => {
      const { target } = event;

      if (target.matches('#correct') || target.matches('#incorrect')) {
        const value = target.value;
        if (value) {  
         forceFetch(value)
            const buttonsToRemove = document.querySelectorAll('#correct, #incorrect');
            buttonsToRemove.forEach((button) => {
              button.setAttribute('disabled', '');
            });
        }
      }
    };

    document.addEventListener('click', handleButtonClick);

    // clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  },);

//authorize conversation
  useEffect(() => {
    if (startIndex === 0) {
      setIsLoading(true);
      fetch('http://34.70.228.66:8881/api/initConversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Authorization: '911e38a68298a5a40742b78cbb402c126730a66b7eda67dc9744cf27a1feec20',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
        //set welcome response
          let botMessage = {
            text: data.response,
            sender: 'bot',
            metadata: 'host',
            metaindex: 0
          };
          console.log(data);

          if (data.state !== 'success') {
            botMessage = {
              text: 'ERROR! Backend response failed.',
              sender: 'bot',
              metadata:'fail'
            };
          }
          //add welcome response to messages arary
          setMessages((prevMessages) => [...prevMessages, botMessage]);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error:', error);
          setIsLoading(false);
        });
      setStartIndex(1);
    }
  }, [startIndex, token, userEmail]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() !== '') {
        handleFormSubmit(e); // Call the form submit handler when Enter is pressed
      }
    } else {
      if (inputValue.length <= maxCharacters) {
        setInputText(inputValue);
        setCharacterCount(inputValue.length);
      }
      const textarea = e.target;
      textarea.style.height = 'auto'; // Reset height to get accurate scroll height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on scroll height

      if (inputValue.length >= maxCharacters) {
        setCharacterLimitReached(true);
      } else {
        setCharacterLimitReached(false);
      }
    }
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setCharacterCount(0)

    // set button values to incorrect
    const buttonsToRemove = document.querySelectorAll('#correct, #incorrect');
            buttonsToRemove.forEach((button) => {
              button.setAttribute('disabled', '');
            });

    //handle user input
    if (inputText.trim() !== '') {
      const userMessage = {
        text: inputText,
        sender: 'user',
        date: AddTime(),
        metadata: 'null',
      };
    
      if (/[@#%^&*(){}|<>]/.test(inputText)) {
        setIsLoading(true)
        const errorMessage = {
          text: 'Input contains special characters. Please try again.',
          sender: 'bot',
          metadata: 'fail'
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        setInputText('')
        setIsLoading(false)
        return;
      }
    //add user message to messages array
      setMessages((prevMessages) => [...prevMessages, userMessage]);

//conversation api post
if (startIndex !== 0) {
  console.log('FETCHING')
  setBotMetadata('bot')
  setIsLoading(true);
  fetch('http://34.70.228.66:8881/api/startConversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Authorization: '911e38a68298a5a40742b78cbb402c126730a66b7eda67dc9744cf27a1feec20',
    },
    body: new URLSearchParams({
      text: inputText,
      confirm: "False"
    }),
  })
    .then((response) => response.json())
    .then((data) => {
    //set bot response
      let botMessage = {
        text: data.response,
        sender: 'bot',
        services: data.services,
        metadata: 'host',
        metaindex: 0
        
      };
      console.log(data);
      console.log(data.response)
      if (data.state !== 'success') {
        botMessage = {
          text: 'ERROR! Backend response failed.',
          sender: 'bot',
          metadata: 'fail'
        };
      } 
      //add bot message to messages array
      setMessages((prevMessages) =>
  prevMessages.map((message) => ({
    ...message,
    metaindex: message.metaindex + 6,
  }))
);
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      nextMetaIndex += 6
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('Error:', error);
      setIsLoading(false);
    });

setInputText('');
}
}
};

  useEffect(() => {
    if (messages.some((message) => message.metadata === 'host')) {
      setStartRef(1);
    }
  }, [messages]); 

  useEffect(() => {
    const scrollToEnd = () => {
      window.scrollTo(0, document.body.scrollHeight);
    };
  
    if (isLoading) {
      // Scroll to the bottom when loading starts
      scrollToEnd();
    } else {
      // Scroll to the bottom when loading ends
      scrollToEnd();
    }
  }, [isLoading]);

//called when confirm value becomes correct
function forceFetch(arg) {
  if (startIndex !== 0) {
    console.log('FETCHINGTRUE')
    setBotMetadata('confirmed')
    setIsLoading(true);
    fetch('http://34.70.228.66:8881/api/startConversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Authorization: token,
      },
      body: new URLSearchParams({
        text: arg,
        confirm: 'True'
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        let botMessage = {
          text: data.response,
          sender: 'bot',
          services: data.services,
          metadata: 'confirmed'
        };
        console.log(data);
        if (data.state !== 'success') {
          botMessage = {
            text: 'ERROR! Backend response failed.',
            sender: 'bot',
            metadata: 'fail'
          };
        }
        
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setIsLoading(false);
        console.log(botMetadata)

        
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
      
  
  setInputText('');
}
}

useEffect(() => {
  const scrollToEnd = () => {
    window.scrollTo(0, document.body.scrollHeight);
  };

  if (isLoading) {
    // Scroll to the bottom when loading starts
    scrollToEnd();
  } else {
    // Scroll to the "fail" element when loading ends
    const failMessageIndex = messages.findIndex((message) => message.metadata === 'fail');
    if (failMessageIndex !== -1) {
      setTimeout(() => {
        scrollToEnd()
      }, 0);
    }
  }
}, [isLoading, messages]);

const handleBotTextChange = (e, index) => {
  const newText = e.target.value;
  setMessages((prevMessages) => {
    const newMessages = [...prevMessages];
    newMessages[index].text = newText;
    return newMessages;
  });
};

useEffect(() => {
  // Update the div heights in state whenever the ref value changes
  setDivHeights(divHeightsRef.current);
}, []);

const handleHeightReady = (height, index) => {
  // Update the height of the div at the specified index
  divHeightsRef.current[index] = height;
  setDivHeights([...divHeightsRef.current]);
};

const handleMove = (message, row) => {
  const textareaElement = document.getElementById('myTextarea');
  const messageText = message.text;
  const doc = new DOMParser().parseFromString(messageText, 'text/html');

  // Get the current content of the textarea
  let textareaContent = textareaElement.value;

  // Split the textarea content into an array of lines
  let lines = textareaContent.split('\n');

  if (!currentRow && currentRow !== 0) {
    textareaElement.value += doc.body.textContent + "\n" ;
  }

  if (currentRow <= 0) {
   
  }

  // Ensure the row is within the valid range
  
    // Insert the content of the draggable element at the specified row
    lines[currentRow] = doc.body.textContent;

    // Join the lines back together with newline characters
    textareaContent = lines.join('\n');

    // Update the textarea with the modified content
    textareaElement.value = textareaContent;
  
};

const onDrag = (e, data, message) => {
  setIsDragging(true);

  const draggableElement = draggableRef.current;
  const draggableRect = draggableElement.getBoundingClientRect();
  const draggableTop = draggableRect.top;
  const draggableLeft = draggableRect.left;
  const draggableWidth = draggableRect.width;
  const draggableHeight = draggableRect.height;

  const textareaElement = document.getElementById('myTextarea');
  const textareaRect = textareaElement.getBoundingClientRect();
  const textareaTop = textareaRect.top;
  const textareaLeft = textareaRect.left;
  const textareaWidth = textareaRect.width;
  const textareaHeight = textareaRect.height;

  let { x, y } = data; // Extract the position from the data object

  const draggablePositionTop = draggableTop + y;
  const draggablePositionLeft = draggableLeft + x;

  const lineHeight = parseInt(window.getComputedStyle(textareaElement).lineHeight, 10);

  
  const row = Math.floor((draggablePositionTop - textareaTop) / lineHeight)
  setCurrentRow(row - message.metaindex)
  console.log(row)
  console.log("META:" + message.metaindex)

  console.log(currentRow)
  if (
    draggablePositionTop >= textareaTop &&
    draggablePositionTop + draggableHeight <= textareaTop + textareaHeight &&
    draggablePositionLeft >= textareaLeft &&
    draggablePositionLeft + draggableWidth <= textareaLeft + textareaWidth
  ) {
    setIsHovering(true);

  } else {
    setIsHovering(false);
  }
};


const handleDragEnd = (e, data, message) => {
  const draggableElement = draggableRef.current;
  const draggableRect = draggableElement.getBoundingClientRect();
  const draggableTop = draggableRect.top;
  const draggableLeft = draggableRect.left;
  const draggableWidth = draggableRect.width;
  const draggableHeight = draggableRect.height;
  console.log(draggableHeight)

  const textareaElement = document.getElementById('myTextarea');
  const textareaRect = textareaElement.getBoundingClientRect();
  const textareaTop = textareaRect.top;
  const textareaLeft = textareaRect.left;
  const textareaWidth = textareaRect.width;
  const textareaHeight = textareaRect.height;

  let { x, y } = data; // Extract the position from the data object

  const draggablePositionTop = draggableTop + y;
  const draggablePositionLeft = draggableLeft + x;

  if (
    draggablePositionTop >= textareaTop &&
    draggablePositionTop + draggableHeight <= textareaTop + textareaHeight &&
    draggablePositionLeft >= textareaLeft &&
    draggablePositionLeft + draggableWidth <= textareaLeft + textareaWidth
  ) {
    handleMove(message, currentRow);
  }

  setIsDragging(false);
  setIsHovering(false);
};

const getUiHeight = () => {
  const newHeight = uiRef.current.clientHeight
  console.log("NEWHEIGHT:" + newHeight)
  setHeight(newHeight)
}

useEffect(() => {
  getUiHeight();
}, [messages]);


useEffect(() => {
  window.addEventListener("resize", getUiHeight);
}, []);

  return (
    <>
    <div className="flex flex-row-reverse justify-center" spellCheck="false">
    
    <div>
      <div className="w-[78.002rem] left-[50%] absolute">
        <textarea
            className={`${!isHovering ? " w-full h-full bg-gray-100 textareaone text-left absolute tracking-tightest"
                      : " w-full h-full bg-gray-100 rounded-lg textareaone text-left absolute tracking-tightest"
                      }`}
            id="myTextarea"
            style = {{height: height < 950 ? "47em" : height}}
          ></textarea>
      </div>
    </div> 
    <div
       className="border-r-2 border-l-2 w-[2rem] border-gray-400 right-[49%] bg-white absolute"
       style={{height: height < 950 ? "62.85em" : height}}
       >
       
      </div>
    <div className="chatbotui relative right-[28.5%] z-50" ref={uiRef}> 
    <div className="min-w-[160rem]">
    </div>
      <div className="flex flex-col ml-10 center-items">
      <h2 className="text-center relative pt-4 pb-6 text-gray-400 text-xl font-semibold tracking-wide">AI CHATBOX</h2>
        {messages.map((message, index) => (   
        <DraggableCore>
        <div ref={draggableRef}>
          <TransitionGroup>
              <CSSTransition key={index} timeout={300} classNames="fade">
                <>
                  

                  <div
                    className={`message ${message.sender === 'user' ? 'user flex flex-row items-center' : 'bot'}`}
                  >
                    <p className="datetime mt-5 ml-5 text-lg text-center">{message.date}</p>
                  
                    <div
                      key={index}
                      className={message.sender === 'bot' && 'border-2 h-[10rem] w-[39rem] bg-gray-300 absolute'}
                      style={{ height: divHeights[index] }}
                    ></div>
  
                      <Draggable
                        axis="both"
                        disabled={message.sender !== 'bot' || !isHoverable}
                        onDrag={(e, data) => onDrag(e, data, message)}
                        onStop={(e, data) => handleDragEnd(e, data, message)} // Call handleDragEnd on drag stop
                        position={{x:0,y:0}} 
                      >
                      <ReactHeight key={index} onHeightReady={height => handleHeightReady(height, index)}>

                        <div           
                          ref={draggableRef}               
                          className={`max-w-[60rem] min-w-[20rem] w-[39rem] message text-lg ${ isHovering ?
                            
                            message.metadata === 'fail'
                              ? 'fail-chat border-solid border-2 w-[39rem]'
                              : message.metadata === 'host'
                              ? 'host-chat-hover border-solid border-2 w-[39rem]'
                              : message.sender === 'bot'
                              ? 'host-chat-hover border-solid border-2 w-[39rem]'
                              : 'user-chat w-auto border-solid '

                            : message.metadata === 'fail'
                              ? 'fail-chat border-solid border-2 w-[39rem]' 
                              : message.sender === 'bot'
                              ? 'host-chat border-solid border-2 w-[39rem]'
                              : 'user-chat w-auto border-solid '
                          } p-2 break-words mt-5`}
                        >
                        
                        {!isDragging
                              && message.sender === 'bot' &&
                              <button
                               className="absolute"
                               onClick={(e) => handleMove(message)}
                               onMouseEnter={() => setisHoverable(false) }
                               onMouseLeave={() => setisHoverable(true)}
                               >
                                <img 
                                  alt="pin button" 
                                  src="https://i.imgur.com/415r0ne.png" 
                                  className="relative w-[30%] h-[30%] rounded-r-[4px] bottom-[0.6rem] left-[38.3rem] border-t-2 border-r-2 border-b-2 pl-4 pr-4 pt-2 pb-2 pin"
                                  />
                              </button>
                              }
                          <div className="flex flex-col text-left items-center justify-start">
                            {message.sender === 'bot' && (
                              <p
                                className={
                                  message.metadata === 'fail'
                                    ? 'fail bg-white pt-4 pr-2 ml-5 h-full w-[5rem] text-center'
                                    : 'bg-white pt-1 pb-4 pr-10 tracking-wide ml-5 h-full w-[4-rem] font-semibold text-gray-400'                                                                         
                                }
                              >
                                {message.metadata === 'fail' ? 'ERROR' : 'AI BOT'}
                              </p>
                            )}
                            <div className="flex flex-row items-end">
                              <div
                                className={
                                  message.sender === 'user'
                                    ? 'w-full p-2 tracking-wide leading-5 user-text md:leading-7 text-left pr-[10rem] text-lg'
                                    : 'w-full pt-2 pb-2 pl-2 text-left pr-4'
                                }
                              >
                                {message.sender === 'user' 
                                 ? message.text
                                 :  
                                  <ContentEditable
                                    html={message.text}
                                    disabled={message.sender !== 'bot'}
                                    onChange={(e) => handleBotTextChange(e, index)}
                                    className="break-words w-[34rem]"
                                  />
                                }
                              </div>
                            </div>
                          </div>
                          </div>
                        </ReactHeight>
                      </Draggable>
                    
                
                </div>
                </>
              </CSSTransition>
              
            
            
          </TransitionGroup>
          </div>
      </DraggableCore>
      
      ))}
          {isLoading && <Loading arg={botMetadata === 'confirmed' ? 'confirmed' : startRef === 0 ? 'host' : 'bot'} />}
          <form className="pt-4 pb-4 pl-[-1rem]" onSubmit={handleFormSubmit}>
            <div className="flex-grow flex flex-row justify-between items-end px-4 rounded-3xl border-2 inputarea lg:h-full min-w-[39rem] textarea1">
            <textarea
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleInputChange}
              placeholder={startRef === 0 ? 'Initializing, please wait...' : 'Type your message...'}
              className="outline-none break-word textarea1 min-w-[34rem] pt-2 pb-2 border-r-2"
              disabled={startRef === 0}
              rows={1}
              maxLength={maxCharacters} // Set the maximum character limit
           />
              
              <button
                className="pl-2 pb-2 pr-3 pt-2 rounded-r-3xl hover:opacity-80 buttonone"
                disabled={startRef === 0}
                alt="button"
              >
                SEND
              </button>
            </div>
            <div className="min-w-[39rem]">
            <p className={characterLimitReached ? 'text-red-500 text-right mt-2 underlogo mr-[1em]' : 'text-right mt-2 underlogo mr-[1rem]'}>{characterCount}/{maxCharacters}</p>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default ChatbotUI