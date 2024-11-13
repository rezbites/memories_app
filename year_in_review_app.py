from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.image import Image
from kivy.uix.video import Video
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.uix.gridlayout import GridLayout
from kivy.graphics import Color, Rectangle
import os
from utils.media_manager import MediaManager
from utils.video_compiler import VideoCompiler

class YearInReviewApp(App):
    def build(self):
        self.media_manager = MediaManager()
        self.video_compiler = VideoCompiler()

        layout = BoxLayout(orientation='vertical')

        # Home screen
        self.home_screen = BoxLayout(orientation='vertical', padding=20)
        self.home_screen.add_widget(Label(text='Create Your Year in Review', font_size=24, bold=True))
        start_button = Button(text='Get Started', on_press=self.navigate_to_gallery, size_hint_y=None, height=50)
        self.home_screen.add_widget(start_button)

        # Gallery screen
        self.gallery_screen = BoxLayout(orientation='vertical')
        self.gallery_grid = GridLayout(cols=3, spacing=2)
        self.gallery_screen.add_widget(self.gallery_grid)

        self.selected_media = []
        self.next_button = Button(text='Next', on_press=self.navigate_to_preview, size_hint_y=None, height=50)
        self.gallery_screen.add_widget(self.next_button)

        # Preview screen
        self.preview_screen = BoxLayout(orientation='vertical', padding=20)
        self.preview_video = Video(size_hint=(1, 0.8))
        self.preview_screen.add_widget(self.preview_video)
        self.generate_button = Button(text='Generate Video', on_press=self.generate_video, size_hint_y=None, height=50)
        self.preview_screen.add_widget(self.generate_button)

        self.current_screen = self.home_screen
        layout.add_widget(self.current_screen)

        return layout

    def navigate_to_gallery(self, _):
        self.current_screen.opacity = 0
        self.gallery_screen.opacity = 1
        self.current_screen = self.gallery_screen
        self.load_media()

    def navigate_to_preview(self, _):
        self.current_screen.opacity = 0
        self.preview_screen.opacity = 1
        self.current_screen = self.preview_screen

    def load_media(self):
        self.media_manager.load_media()
        for item in self.media_manager.media:
            if item.media_type == 'image':
                image = Image(source=item.uri, size_hint=(1/3, 1/3))
                image.bind(on_touch_down=self.toggle_media_selection)
                self.gallery_grid.add_widget(image)
            elif item.media_type == 'video':
                video = Video(source=item.uri, size_hint=(1/3, 1/3))
                video.bind(on_touch_down=self.toggle_media_selection)
                self.gallery_grid.add_widget(video)

    def toggle_media_selection(self, instance, touch):
        if instance.collide_point(*touch.pos):
            media_item = next((item for item in self.media_manager.media if item.uri == instance.source), None)
            if media_item:
                if media_item in self.selected_media:
                    self.selected_media.remove(media_item)
                    instance.color = (1, 1, 1, 1)
                else:
                    self.selected_media.append(media_item)
                    instance.color = (0.5, 0.5, 0.5, 0.5)

        if len(self.selected_media) > 0:
            self.next_button.disabled = False
        else:
            self.next_button.disabled = True

    def generate_video(self, _):
        self.preview_video.state = 'stop'
        self.generate_button.disabled = True
        Clock.schedule_once(self.compile_video, 0.5)

    def compile_video(self, _):
        output_path = self.video_compiler.compile_video(self.selected_media, {
            'duration': 30,
            'music': None,
        })
        self.preview_video.source = output_path
        self.preview_video.state = 'play'
        self.generate_button.disabled = False

if __name__ == "__main__":
    YearInReviewApp().run()
