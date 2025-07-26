import React from "react"

const categories = [
  {
    title: "CASUALS",
    label: "Casual Wear",
    image: "http://staranddaisy.in/wp-content/uploads/2022/04/204627fsd.jpg",
  },
  {
    title: "CO-ORD SET",
    label: "Co-ord set",
    image: "https://i.pinimg.com/originals/b0/ed/90/b0ed903d5411d3cf0b4e94abacaa623e.jpg",
  },
  {
    title: "DRESS",
    label: "Dress Type",
    image: "https://greenweddingshoes.com/wp-content/uploads/2023/01/romantic-square-neckline-backless-a-line-wedding-dresses-1.jpeg",
  },
  {
    title: "PARTY WEAR",
    label: "Party Wear",
    image: "/assets/images/Untitled (822 x 660 px).png",
  },
  {
    title: "SALWAR SUIT",
    label: "Salwar Suit",
    image: "https://i.pinimg.com/originals/1a/9e/61/1a9e6194ca3f2399e736da9171e4156a.png",
  },
]

export default function CategorySection() {
  return (
    <section className="category-section">
      <h2 className="category-title">Categories</h2>
      <div className="category-grid">
        {categories.map((item, index) => (
          <div className="category-card" key={index}>
            <div className="image-container">
              <img src={item.image} alt={item.title} className="category-image" />
              <div className="overlay-text">{item.title}</div>
            </div>
            <p className="category-label">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
