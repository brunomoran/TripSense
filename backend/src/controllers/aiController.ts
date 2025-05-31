import { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";

// Configuración del cliente de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// Esquema para la respuesta de Gemini
const itinerarySchema = {
    type: Type.OBJECT,
    properties: {
        days: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: {
                        type: Type.STRING,
                        description: "ID único del día"
                    },
                    date: {
                        type: Type.STRING,
                        description: "Fecha en formato YYYY-MM-DD"
                    },
                    activities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: {
                                    type: Type.STRING,
                                    description: "ID único de la actividad"
                                },
                                poi: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: {
                                            type: Type.NUMBER,
                                            description: "ID numérico del punto de interés"
                                        },
                                        name: {
                                            type: Type.STRING,
                                            description: "Nombre del lugar con emoji apropiado"
                                        },
                                        description: {
                                            type: Type.STRING,
                                            description: "Dirección o descripción del lugar"
                                        },
                                        category: {
                                            type: Type.STRING,
                                            description: "Categoría: Restaurantes, Museos, Atracciones, Cafés, etc."
                                        },
                                        imageUrl: {
                                            type: Type.STRING,
                                            description: "URL de imagen (puede estar vacía)"
                                        },
                                        location: {
                                            type: Type.OBJECT,
                                            properties: {
                                                lat: {
                                                    type: Type.NUMBER,
                                                    description: "Latitud del lugar"
                                                },
                                                lng: {
                                                    type: Type.NUMBER,
                                                    description: "Longitud del lugar"
                                                }
                                            },
                                            required: ["lat", "lng"]
                                        }
                                    },
                                    required: ["id", "name", "description", "category", "imageUrl", "location"]
                                },
                                startTime: {
                                    type: Type.STRING,
                                    description: "Hora de inicio en formato HH:MM"
                                },
                                endTime: {
                                    type: Type.STRING,
                                    description: "Hora de fin en formato HH:MM"
                                },
                                notes: {
                                    type: Type.STRING,
                                    description: "Notas adicionales (puede estar vacío)"
                                }
                            },
                            required: ["id", "poi", "startTime", "endTime", "notes"]
                        }
                    }
                },
                required: ["id", "date", "activities"]
            }
        }
    },
    required: ["days"]
};

export const generateItinerary = async (req: Request, res: Response) => {
    try {
        const { destination, startDate, endDate, transportModes, preferences, availablePois } = req.body;

        // Construir el prompt para Gemini
        let prompt = `Voy a hacer un viaje a ${destination} entre las fechas ${startDate} y ${endDate}. 
Quiero moverme usando los siguientes modos de transporte: ${transportModes.join(", ")}.`;

        if (preferences && preferences.trim()) {
            prompt += `\nTen en cuenta esta información adicional: "${preferences}".`;
        }

        if (availablePois && availablePois.length > 0) {
            prompt += `\n\nA continuación te proporciono una lista de puntos de interés específicos de ${destination} que debes considerar para crear el itinerario. Intenta utilizar estos lugares en lugar de inventar otros:\n`;

            let randomPois: any[] = []

            if (availablePois.length <= 30) {
                randomPois = [...availablePois];
            } else {
                // Crear una copia del array para no modificar el original
                const poisCopy = [...availablePois];

                // Algoritmo Fisher-Yates (o Knuth) para mezclar el array
                for (let i = poisCopy.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [poisCopy[i], poisCopy[j]] = [poisCopy[j], poisCopy[i]];
                }

                // Tomar los primeros 30 después de mezclar
                randomPois = poisCopy.slice(0, 30);
            }

            // Limitar a un máximo de 30 POIs para no sobrecargar el prompt
            const limitedPois = availablePois.slice(0, 30);
            limitedPois.forEach((poi: any, index: number) => {
                prompt += `${index + 1}. ${poi.name} (${poi.category}): ${poi.description || 'Sin descripción'}\n`;
            });

            prompt += `\nPor favor, utiliza estos puntos de interés reales en el itinerario generado siempre que sea posible.`;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: itinerarySchema,
            }
        })

        if (!response) {
            return res.status(500).json({ error: "Error generando el itinerario" });
        }

        console.log("Itinerary generated successfully:", response);

        return res.status(200).json(response);


    } catch (error) {
        console.error("Error generating itinerary:", error);
        return res.status(500).json({ error: "Error generando el itinerario" });
    }
};