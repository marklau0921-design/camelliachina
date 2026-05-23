import React from 'react';

interface DestinationCard {
  id: number;
  name: string;
  description: string;
  image: string;
}

const destinationData: DestinationCard[] = [
  {
    id: 1,
    name: 'GUILIN',
    description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone, creating timeless beauty that has inspired artists for centuries.',
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/aGetsU6WzDik5Fd30KgLRf-img-1_1770122853000_na1fn_Z3VpbGluLWJlbG92ZWQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L2FHZXRzVTZXekRpazVGZDMwS2dMUmYtaW1nLTFfMTc3MDEyMjg1MzAwMF9uYTFmbl9aM1ZwYkdsdUxXSmxiRzkyWldRLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=d6vYsr84n7igs~POJw~XOSHQ9Mjz0vufvhmjK9cXpjIOu~4aTwEB12v9hzf0CovlR7rxy0muh4304g6NxBJ8xXFDS2klqND70cvT0-GyV27zMGXqei~lSMsqmUvCCTQO3A9sAX35Y48zygVQBeJ8otDlNsPxm65bcOQFPp86RnOyzVN-Hx9wNmAQ4a5ckuMFQh5cRJzqGJFQWTY6MIpA4QMEm1EqCazbSE~fKUZtdBdAvOxh7CpHCa~XIJOl7leeC3pUtd9cNV9Kg~StWnRRWRBWGmR~8~noYUzGRHRk~fgT6uMmy90WPvEnLF9Yl3NiVRTRKMHlOg1fO7F~VIkQlg__'
  },
  {
    id: 2,
    name: 'ZHANGJIAJIE',
    description: 'Towering stone pillars pierce the clouds. A realm of vertical cliffs and misty valleys, where nature sculpts monuments to inspire wonder and adventure.',
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/aGetsU6WzDik5Fd30KgLRf-img-2_1770122861000_na1fn_emhhbmdqaWFqaWUtYmVsb3ZlZA.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L2FHZXRzVTZXekRpazVGZDMwS2dMUmYtaW1nLTJfMTc3MDEyMjg2MTAwMF9uYTFmbl9lbWhoYm1kcWFXRnFhV1V0WW1Wc2IzWmxaQS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=VcS~sm08xtmmdBuF4I-tZ5u5VGFySJQE3LucfKJ5s2iS1Ju-H00UlCbf7a4tJQVA39oHUBiyPsuRMenyjfxaBHaoTqEF2XnHp8V6GdsM3RkdhDZIUevYaaZdydjl9pbFmNeI17WqpeM6IMSQiWGG63B0bQoy1q1MjDGD0DWZNTohg~03YxXZXJbtVglHQLVFC57EUbyAaPSn9YRG5LEj3C5~EgJ1kMqRFFGOeJl2cup0i72EXgzGZWNGFS199TVBgCWkQiZsBUwNs7b-QZYYV-~NW7w147b47NmFjfy-GQGjtPIKE9FqsenZbxhruWIyktFrTvKE3bCq16PMN1Znxw__'
  },
  {
    id: 3,
    name: 'YUNNAN',
    description: 'Terraced rice fields cascade down mountainsides. Golden waves of grain reflect centuries of harmony between people and landscape.',
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/aGetsU6WzDik5Fd30KgLRf-img-3_1770122854000_na1fn_eXVubmFuLWJlbG92ZWQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L2FHZXRzVTZXekRpazVGZDMwS2dMUmYtaW1nLTNfMTc3MDEyMjg1NDAwMF9uYTFmbl9lWFZ1Ym1GdUxXSmxiRzkyWldRLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=vqY~FA-wIsTxjVcSwsOAUxsNT5GG0lGr04kr1v8xOYIN3w32b3NW1LD3ej0hX3NmZ0ggvwRQ~igYGyDo7nu~h7QJuXZ2kEafhw-SIxtPTtk5vboCK71tuL5jfojH~1Xhuw2xPh1zscNmYZek6qP53dmKLwFYZuceOG1molR94bXEYXksUt-lZrWBGgZOfJ3Yg2lzINZQnbHt~rFQEDbhDApYs2WBiSvwyCdEYU45b5XzHdMSZ58nJFmNbQwwrhOAGRTSuhB8i5PVKKFCqY4bnCFxeXfzq5BLzTj1ULfSjc8pzyNsqxqSqyxLEdam054plLjZti~x35AhBB~5WLObWA__'
  },
  {
    id: 4,
    name: 'TIBET',
    description: 'Stand at the roof of the world where vast grasslands meet snow-capped Himalayas, prayer flags flutter in thin air, and infinite horizons inspire profound tranquility.',
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/aGetsU6WzDik5Fd30KgLRf-img-4_1770122859000_na1fn_dGliZXQtYmVsb3ZlZA.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L2FHZXRzVTZXekRpazVGZDMwS2dMUmYtaW1nLTRfMTc3MDEyMjg1OTAwMF9uYTFmbl9kR2xpWlhRdFltVnNiM1psWkEuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aO3atH9g9wSw3LKr4ixZ4QiDIt21TgqxPHOmoX9iRX6cvg6UdS6rCq4yQvkeSznpHzQu7xTxqsnEQP2apPatL7iRl09ml6BDoA9Kz23bwowbRSAw-d~BA7bDvL61rUXjErURw8TUgKoTiKawGWKo-2-CdcWVn0X9TKRfAWK192ZQOtlvIJyKZ5AvMdUeAgm-cOBC22Zxxr4~n6Wnno~avBo7A8YbLfBoDp3QFQcL0M0HIN4SXm44B~8a4oBrdbH85vJhEtsXg2SudYTcou53VaWOx6GHONXsflAPmtqX6rgzhBo~7unr5KM3N1mFJg6BZNxO1ygS-QHbUl2TH64qkA__'
  }
];

export default function BelovedPlacesGrid() {
  return (
    <section className="bg-[#F5F3EF]">
      <div className="flex flex-col lg:flex-row min-h-screen lg:min-h-[600px]">
        {/* 左侧深灰色背景 - 30% */}
        <div className="w-full lg:w-[30%] bg-[#3A3A3A] px-8 lg:px-12 py-12 lg:py-16 flex flex-col justify-center">
          <h2 className="text-white font-serif text-3xl lg:text-4xl font-light mb-4 tracking-wide">
            FROM BELOVED PLACES
          </h2>
          <p className="text-gray-300 text-sm font-light leading-relaxed max-w-sm">
            Remarkable experiences to inspire the mind. Picture yourself strolling down sun-soaked beaches, journeying through jungles, or honouring the history of celebrated cities.
          </p>
        </div>

        {/* 右侧卡片网格 - 70% */}
        <div className="w-full lg:w-[70%] bg-[#F5F3EF] p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinationData.map((destination) => (
              <div 
                key={destination.id}
                className="relative overflow-hidden group h-[350px] md:h-[320px] lg:h-[300px]"
              >
                {/* 图片 */}
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>

                {/* 内容 */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-white font-serif text-2xl font-light mb-3">
                    {destination.name}
                  </h3>
                  <p className="text-gray-200 text-xs leading-relaxed font-light line-clamp-2">
                    {destination.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
