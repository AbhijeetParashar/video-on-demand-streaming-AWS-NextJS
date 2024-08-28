"use client";

import { useState } from "react";
import Player from "./Player";

interface IContents {
  courseList: any[];
}

const Contents = ({ courseList }: IContents) => {
  const [selectedVideo, setSelectedVideo] = useState(courseList[0]);

  return (
    <>
      {courseList?.length > 0 ? (
        <div className="flex p-2">
          <div className="h-screen max-w-[270px] relative border-r-2 border-sky-500 mr-3">
            {courseList?.map((video: any) => (
              <div
                key={video.title}
                className="h-10 w-full border-b border-gray-400 p-1 cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {video.title}
              </div>
            ))}
          </div>
          <div className="h-full w-[calc(100%-270px)]">
            <Player selectedVideo={selectedVideo} />
          </div>
        </div>
      ) : (
        <div>No Data</div>
      )}
    </>
  );
};

export default Contents;
