import React, { useState } from "react";

function App() {

  const [book, setBook] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async () => {

    const response = await fetch(`http://127.0.0.1:8000/recommend?book=${book}`);

    const data = await response.json();

    setRecommendations(data.recommendations);
  };

  return (

    <div style={{fontFamily:"Arial", textAlign:"center", padding:"40px"}}>

      <h1> Book O' Clock</h1>
      <p>AI powered book recommendations</p>

      <div style={{marginTop:"30px"}}>

        <input
          type="text"
          placeholder="Enter a book name..."
          value={book}
          onChange={(e) => setBook(e.target.value)}
          style={{
            padding:"10px",
            width:"300px",
            fontSize:"16px"
          }}
        />

        <button
          onClick={getRecommendations}
          style={{
            marginLeft:"10px",
            padding:"10px 20px",
            fontSize:"16px",
            cursor:"pointer"
          }}
        >
          Recommend
        </button>

      </div>

      <h2 style={{marginTop:"40px"}}>Recommended Books</h2>

      <div style={{
        display:"flex",
        justifyContent:"center",
        flexWrap:"wrap",
        marginTop:"20px"
      }}>

        {recommendations.map((rec, index) => (

          <div
            key={index}
            style={{
              border:"1px solid #ddd",
              borderRadius:"10px",
              padding:"20px",
              margin:"10px",
              width:"200px",
              boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
            }}
          >
            <h4>{rec}</h4>
          </div>

        ))}

      </div>

    </div>
  );
}

export default App;