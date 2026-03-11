import React from "react";

const moods = [
  "Calm",
  "Motivated",
  "Romantic",
  "Dark",
  "Adventurous",
  "Reflective"
];

function MoodSelector({ setMood }) {

  return (

    <div className="py-20 bg-gray-50">

      <h2 className="text-center text-3xl font-semibold text-gray-700 mb-12">
        Choose your mood
      </h2>

      <div className="flex flex-wrap justify-center gap-8">

        {moods.map((mood) => (

          <button
            key={mood}
            onClick={() => setMood(mood)}
            className="px-8 py-4 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition text-gray-700 font-medium"
          >
            {mood}
          </button>

        ))}

      </div>

    </div>

  );
}

export default MoodSelector;