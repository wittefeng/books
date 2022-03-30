---
title: useEffect 中如何使用 async/await
---

```JavaScript
async function fetchApi(){
  let response = await fetch('api/data')
  response = await res.json()
  dataSet(response)
}

useEffect(()=> {
  fetchApi()
},[])

```

```JavaScript
useEffect(() => { 
  (async function anyNameFunction() { 
    await loadContent(); 
  })();
}, []);
```