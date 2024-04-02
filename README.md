# NeuralCloak: Fooling CLIP models that overwrite art

This project presents an alternative way for artists to protect their art from web scrapers. Instead of creating an adversarial example to fool the diffusion model, we can fool the text-image similarity model; images with a similarity of less than 0.3 to their caption are silently removed from the dataset, which means what by minimizing the cosine similarity between the image and its caption, we can create an adversarial example that will not be included in a dataset. We use CLIP ViT32 as the victim model and validate our results on CLIP ViT16. The code is written so that we can make the same image an adversarial example for multiple models, simply by appending to the end of the models list. 

# How to Run: 
Clone the repository and use docker-compose to run it. Make sure that you don't have any processes on port 3000 (React), 8080 (Server), or 6379 (Redis). 
```
git clone https://github.com/floatingtrees/NeuralCloak.git
cd NeuralCloak
docker-compose up --build
```

# How to Use
Go to localhost:3000 to interact with the website. Upload an image, fill out its current caption, along with a fake caption. Then, click the blue button to protect your image. The server will optimize your image to minimize cosine similarity with the real caption and maximize cosine similarity with the deceptive caption. 

# Contributors
Jonathan Zhou
