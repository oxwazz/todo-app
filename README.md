//  `${filterData=='is_done'?filterData +  " " +"IS"+ " " + filterValue:filterData +  " " +"ILIKE"+ " " + filterValue}`  '%filterValue%'
    //  `${filterData?filterData +  " " +"ILIKE":""}`
    
    // SELECT * FROM tasks WHERE ${filterData} ILIKE '%${filterValue}%';
    // SELECT * FROM tasks where ${filterData} IS '%${filterValue}%';
    // SELECT * FROM tasks where is_done IS FALSE;
    
    //const getTask = await pool.query(offset || limit  ? offLimQuery : regQuery)


    todos?filter=nama:mahal&limit=1
    todos?filter=nama:mahal&offset=1
    todos?filter=nama:mahal&limit=1&offset=1
    