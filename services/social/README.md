# `'/api/create-token'` endpoint

This endpoint is used to create a new authentication token for a user. It requires the user to be authenticated and will return a token that can be used for subsequent requests.
Le client fait la requête avec son cookie httpOnly pour prouver son identité via le JWT.
Le preHandler vérifie le JWT et ajoute l'ID utilisateur à la requête -> jwt.verify() extrait le token, verifie sa validité et décode son conten puis le met dans request.user.
