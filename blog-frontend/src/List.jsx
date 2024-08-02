const List = () => {
    let people = [
        {
            id: 0,
            name: "Elisia",
            email: "elisia@unis.kr",
        },
        {
            id: 1,
            name: "Gehlee",
            email: "gehlee@unis.kr",
        },
        {
            id: 2,
            name: "Seowon",
            email: "seowon@unis.kr",
        },
        {
            id: 3,
            name: "Yoona",
            email: "yoona@unis.kr",
        },
        {
            id: 4,
            name: "Yunha",
            email: "yunha@unis.kr",
        },
        {
            id: 5,
            name: "Kotoko",
            email: "kotoko@unis.kr",
        },
        {
            id: 7,
            name: "Nana",
            email: "nana@unis.kr",
        },
        {
            id: 7,
            name: "Hyeonju",
            email: "hyeonju@unis.kr",
        },

    ]
    return (
        <div>
            {people.map((item) => (
                <div key={item} className="card p-5 border-2">
                    <h1>Name: {item.name}</h1>
                    <p>E-mail: {item.email}</p>
                </div>
            ))}
        </div>
    )
}

export default List;