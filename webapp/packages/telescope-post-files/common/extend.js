
PostUrl = function(f) {
    if (f.post)
        return "/posts/" + f.post + "/file/" + f.name();
    else
        return "/posts/" + f.owner  + "/file/" + f.name();
}
