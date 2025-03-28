import React from 'react';

const FacebookLive: React.FC = () => {
  const url = 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FKoyyyy3%2Fvideos%2F816910090344691&show_text=0&width=560&mute=1'; // Add &mute=1 to mute the video

  return (
    <div className="w-full h-[700px] rounded-lg">
      <iframe
        title="Facebook Video"
        src={url}
        style={{ border: 'none', overflow: 'hidden', width: '100%', height: '100%' }}
        allowFullScreen
        allowTransparency
        allow="autoplay; clipboard-write; picture-in-picture; web-share"
      />
    </div>
  );
};

export default FacebookLive;
